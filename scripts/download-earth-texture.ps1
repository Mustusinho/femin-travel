# NASA Blue Marble: Next Generation, June 2004, topography and bathymetry.
# https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography/
$ErrorActionPreference = 'Stop'
$source = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73726/world.topo.bathy.200406.3x5400x2700.jpg'
$destination = Join-Path $PSScriptRoot '..\public\earth\earth-detail.jpg'
$temporary = "$destination.download"

New-Item -ItemType Directory -Path (Split-Path $destination) -Force | Out-Null
try {
    Invoke-WebRequest -Uri $source -OutFile $temporary
    Add-Type -AssemblyName System.Drawing
    $image = [System.Drawing.Image]::FromFile($temporary)
    try {
        if ($image.Width -ne 5400 -or $image.Height -ne 2700) {
            throw "Unexpected NASA image size: $($image.Width)x$($image.Height)"
        }
    } finally {
        $image.Dispose()
    }
    Move-Item -LiteralPath $temporary -Destination $destination -Force
    Write-Host "Saved NASA globe texture: $destination"
} finally {
    if (Test-Path -LiteralPath $temporary) {
        Remove-Item -LiteralPath $temporary
    }
}
