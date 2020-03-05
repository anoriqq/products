#!/bin/sh

echo "PRODUCT_DIR: $PRODUCT_DIR"
echo "ls -a: $(ls -a | tr '\n' '\t')"
echo "\n"



# mkcertバイナリを取得
BIN_DIR=$PRODUCT_DIR/scripts/bin
MKCERT_BIN_PATH=$BIN_DIR/mkcert
if [ ! -e "$MKCERT_BIN_PATH" ]; then
  if [ ! -d "$BIN_DIR" ]; then
    mkdir $BIN_DIR
  fi
  MKCERT_BINARY_RELEASE=https://github.com/FiloSottile/mkcert/releases/download/v1.4.1/mkcert-v1.4.1-linux-amd64
  sudo curl -L $MKCERT_BINARY_RELEASE -o $MKCERT_BIN_PATH
  sudo chmod 755 $MKCERT_BIN_PATH
fi

# CAファイルを作成してワークスペースにコピー
WORKSPACE_CA_DIR=$PRODUCT_DIR/packages/nginx/ca
WORKSPACE_CA_PATH=$WORKSPACE_CA_DIR/rootCA.pem
CA_PATH=/home/sandbox/.local/share/mkcert/rootCA.pem
if [ ! -e "$WORKSPACE_CA_PATH" ]; then
  sudo $MKCERT_BIN_PATH -install
  echo 'installed ca'
  if [ ! -d "$WORKSPACE_CA_DIR" ]; then
    mkdir $WORKSPACE_CA_DIR
  fi
  sudo cp $CA_PATH $WORKSPACE_CA_DIR
fi

# certを作成
CERT_DIR=$PRODUCT_DIR/packages/nginx/certs
CERT_FILE=$CERT_DIR/public.pem
KEY_FILE=$CERT_DIR/private.pem
if [ ! -e "$CERT_FILE" -o ! -e "$KEY_FILE" ]; then
  if [ ! -d "$CERT_DIR" ]; then
    mkdir $CERT_DIR
  fi
  sudo $MKCERT_BIN_PATH -cert-file $CERT_FILE -key-file $KEY_FILE "*.anoriqq.local" anoriqq.local localhost 127.0.0.1 ::1
fi
