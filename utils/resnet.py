"""
Pure PyTorch ResNet-18 implementation — no torchvision dependency.

This is required because torchvision C-extensions can be blocked on Windows
by Smart App Control / Application Control policies.

Architecture matches the standard torchvision ResNet-18 exactly so that
state_dict weights trained with torchvision can be loaded without any
key-name mapping.

From the distraction notebook (CELL 3):
  - NUM_CLASSES = 10
  - The checkpoint saves model.state_dict() so all layer names must match
    exactly what torchvision's resnet18 produces.
"""

import torch
import torch.nn as nn


# ---------------------------------------------------------------------------
# Building blocks
# ---------------------------------------------------------------------------

def _conv3x3(in_ch: int, out_ch: int, stride: int = 1) -> nn.Conv2d:
    """3×3 convolution with padding=1 (spatial dimensions preserved when stride=1)."""
    return nn.Conv2d(
        in_ch, out_ch,
        kernel_size=3, stride=stride, padding=1, bias=False,
    )


def _conv1x1(in_ch: int, out_ch: int, stride: int = 1) -> nn.Conv2d:
    """1×1 convolution — used for projection shortcuts."""
    return nn.Conv2d(in_ch, out_ch, kernel_size=1, stride=stride, bias=False)


class BasicBlock(nn.Module):
    """
    Standard ResNet basic block (used in ResNet-18 and ResNet-34).
    expansion = 1 means the output channels == planes (no bottleneck).
    """
    expansion: int = 1

    def __init__(
        self,
        inplanes: int,
        planes: int,
        stride: int = 1,
        downsample: nn.Module | None = None,
    ) -> None:
        super().__init__()
        self.conv1      = _conv3x3(inplanes, planes, stride)
        self.bn1        = nn.BatchNorm2d(planes)
        self.relu       = nn.ReLU(inplace=True)
        self.conv2      = _conv3x3(planes, planes)
        self.bn2        = nn.BatchNorm2d(planes)
        self.downsample = downsample
        self.stride     = stride

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        identity = x

        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))

        if self.downsample is not None:
            identity = self.downsample(x)

        out = self.relu(out + identity)
        return out


# ---------------------------------------------------------------------------
# ResNet-18
# ---------------------------------------------------------------------------

class ResNet18(nn.Module):
    """
    ResNet-18 with a configurable number of output classes.

    Layer names are intentionally identical to torchvision's resnet18 so
    that a state_dict saved from torchvision can be loaded directly.

    From the distraction notebook:
      NUM_CLASSES = 10  (State Farm Distracted Driver dataset)
    """

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.inplanes = 64

        # Stem
        self.conv1   = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False)
        self.bn1     = nn.BatchNorm2d(64)
        self.relu    = nn.ReLU(inplace=True)
        self.maxpool = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)

        # Residual stages
        self.layer1 = self._make_layer(64,  blocks=2)
        self.layer2 = self._make_layer(128, blocks=2, stride=2)
        self.layer3 = self._make_layer(256, blocks=2, stride=2)
        self.layer4 = self._make_layer(512, blocks=2, stride=2)

        # Head
        self.avgpool = nn.AdaptiveAvgPool2d((1, 1))
        self.fc      = nn.Linear(512 * BasicBlock.expansion, num_classes)

        # Weight initialisation (matches torchvision defaults)
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode="fan_out", nonlinearity="relu")
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)

    def _make_layer(
        self, planes: int, blocks: int, stride: int = 1
    ) -> nn.Sequential:
        downsample = None
        if stride != 1 or self.inplanes != planes * BasicBlock.expansion:
            downsample = nn.Sequential(
                _conv1x1(self.inplanes, planes * BasicBlock.expansion, stride),
                nn.BatchNorm2d(planes * BasicBlock.expansion),
            )

        layers = [BasicBlock(self.inplanes, planes, stride, downsample)]
        self.inplanes = planes * BasicBlock.expansion
        for _ in range(1, blocks):
            layers.append(BasicBlock(self.inplanes, planes))

        return nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.maxpool(self.relu(self.bn1(self.conv1(x))))
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = torch.flatten(self.avgpool(x), 1)
        return self.fc(x)
