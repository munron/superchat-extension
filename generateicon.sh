#!/bin/bash
# generate icon
for size in 16 48 128
do
  convert source.png -resize ${size}x  -unsharp 1.5x1+0.7+0.02 ./src/icons/${size}.png
done