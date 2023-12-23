#!/bin/sh
set -e
echo "Setting up the project..."
cd packages/hardhat
yarn hardhat circom
cp circuits/cipherhealth.{wasm,zkey} ../nextjs/public/circuit
