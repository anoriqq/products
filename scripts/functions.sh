#!/bin/bash

UTILS_PATH=$PRODUCT_DIR/scripts/utils.sh
source ${UTILS_PATH}



# anコマンドの使い方の説明
function _help_(){
  local FUNCTION_FILE=$PRODUCT_DIR/scripts/functions.sh
  echo "   Usage: an COMMAND [ARG...]"
  echo "   COMMAND:"
  grep -B 1 -E -e '^function\s_.*' $FUNCTION_FILE\
    | grep -E '(^#|^function)'\
    | sed -z 's/\nfunction\s_/:/g'\
    | sed -r 's/(\s|#)//g'\
    | sed -rE 's/_\W+\{$//g'\
    | awk -F ':' '{ printf "       %-22s%s\n", $2, $1 }'
}

# コンテナを起動します
function _up_(){
  local SERVICES=${*:1}
  local TASK_NAME="Start-up product system : ${SERVICES:-all}"
  log "Start" "${TASK_NAME}"
  up ${*:1}
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# すべてのコンテナを停止します
function _down_(){
  local TASK_NAME='Stop all product system'
  log "Start" "${TASK_NAME}"
  down
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# システムを再起動します
function _restart_(){
  local TASK_NAME='Restart product system'
  log "Start" "${TASK_NAME}"
  down
  up ${*:1}
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# コンテナのログを出力します
function _logs_(){
  local TASK_NAME='Display logs from containers'
  log "Start" "${TASK_NAME}"
  docker-compose logs ${*:1}
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# nginxをリスタートします
function _restartNginx_(){
  local TASK_NAME='Restart nginx'
  log "Start" "${TASK_NAME}"
  docker exec -it nginx nginx -s reload
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# dockerコンテナの一覧を表示します
function _ps_(){
  local TASK_NAME='Display docker container list'
  log "Start" "${TASK_NAME}"
  docker-compose ps -a
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# direnvをセットアップします
function _direnv_(){
  $PRODUCT_DIR/scripts/install-direnv.sh
}

# nginxのためにmkcertでcertificationをセットアップします
function _mkcert_(){
  local TASK_NAME='Create a certificate with mkcert'
  log "Start" "${TASK_NAME}"
  _sandbox_ $PRODUCT_DIR/packages/_sandbox/scripts/create-cert.sh
  load docker build -q --rm -t anoriqq/sandbox:latest $PRODUCT_DIR/packages/_sandbox
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "Build sandbox docker image"
  cleanDockerImage
  docker run --rm \
    -v $PRODUCT_DIR:/home/sandbox/workspace \
    -v /c/Users/shota/AppData/Local/mkcert:/home/sandbox/.local/share/mkcert \
    anoriqq/sandbox \
    ./sandbox/scripts/create-cert.sh
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "Create certificate"
  log "Complete" "${TASK_NAME}"
}

# 不要なdockerイメージを削除します
function _cleanDockerImage_(){
  local TASK_NAME='Clean dangling images'
  log "Start" "${TASK_NAME}"
  cleanDockerImage
  log "Complete" "${TASK_NAME}"
}

# すべてのdockerコンテナを削除します
function _cleanDockerContainer_(){
  local TASK_NAME='Clean docker container'
  log "Start" "${TASK_NAME}"
  # docker container ls -aq | grep -e '.*'
  # if [ $? -ne 0 ]; then exit 1; fi
  if docker container ls -aq | grep -e '.*'; then
    docker container stop `docker container ls -aq`
    if [ $? -ne 0 ]; then exit 1; fi
    log "Finish" "Stop container"
  else
    log "Skip" "Container is allready stop"
  fi
  if docker container ls -aq | grep -e '.*'; then
    docker container rm `docker container ls -aq`
    if [ $? -ne 0 ]; then exit 1; fi
    log "Finish" "Remove container"
  else
    log "Skip" "Container is allready clean"
  fi
  log "Complete" "${TASK_NAME}"
}

# ローディングアニメーション
function _po_(){
  local TASK_NAME='Loading animation'
  log "Start" "${TASK_NAME}"
  load sleep 5
  echo -e ''
  log "Complete" "${TASK_NAME}"
}

# 各パッケージでコマンドを実行する
function _exec_(){
  local TASK_NAME="Execute command in $1"
  log "Start" "${TASK_NAME}"
  cd "$PRODUCT_DIR/packages/$1"
  export PRODUCT_DIR=$PWD
  if [ $? -ne 0 ]; then exit 1; fi
  if [ -e "./secret/local.env" ]; then
    export $(cat ./secret/local.env | grep -v '^#' | xargs)
    if [ $? -ne 0 ]; then exit 1; fi
  fi
  log "Run" "${*:2} in $1"
  bash -c "${*:2}"
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# 各パッケージでコマンドを実行する
function _e_(){
  _exec_ ${*:1}
}

# sandboxでコマンドを実行する
function _sandbox_(){
  local TASK_NAME="Execute command in sandbox container"
  log "Start" "${TASK_NAME}"
  # load docker-compose -f $PRODUCT_DIR/packages/_sandbox/docker-compose.yml build
  # if [ $? -ne 0 ]; then exit 1; fi
  # log "Finish" "docker-compose build"
  if [ "${*:1}" = "" ]; then
    docker-compose  -f $PRODUCT_DIR/packages/_sandbox/docker-compose.yml run --rm --service-ports sandbox bash
  else
    log "Run" "${*:1} in sandbox"
    docker-compose -f $PRODUCT_DIR/packages/_sandbox/docker-compose.yml run --rm --service-ports sandbox /bin/bash -c '$0' "${*:1}"
  fi
  # if [ $? -ne 0 ]; then exit 1; fi
  # log "Complete" "${TASK_NAME}"
}

# sandboxでコマンドを実行する
function _s_(){
  _sandbox_ ${*:1}
}

# sandboxのイメージをビルドする
function _sandboxBuild_(){
  local TASK_NAME="Build sandbox container"
  log "Start" "${TASK_NAME}"
  docker-compose -f $PRODUCT_DIR/packages/_sandbox/docker-compose.yml build
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "docker-compose build"
  log "Complete" "${TASK_NAME}"
}

# シークレットの暗号化
function _encrypt_(){
  local TASK_NAME="Encrypt secrets"
  log "Start" "${TASK_NAME}"

  if [ ! $(ls -1 $PRODUCT_DIR/packages | grep "^$1$") ]; then
    log "Error" "Require package name"
    exit 1
  fi

  local SECRET_DIR=$PRODUCT_DIR/packages/$1/secret
  for file in `find $SECRET_DIR -name '*.env'`; do
    gcloud kms encrypt \
      --plaintext-file=$file \
      --ciphertext-file=$file.enc \
      --location=asia-northeast1 \
      --keyring=delay-tweet-test \
      --key=delay-tweet-json-cred
    log "Finish" "Encrypt $file to $file.enc"
  done

  log "Complete" "${TASK_NAME}"
}

# シークレットの復号
function _decrypt_(){
  local TASK_NAME="Decrypt secrets"
  log "Start" "${TASK_NAME}"

  if [ ! $(ls -1 $PRODUCT_DIR/packages | grep "^$1$") ]; then
    log "Error" "Require package name"
    exit 1
  fi

  local SECRET_DIR=$PRODUCT_DIR/packages/$1/secret
  for file in `find $SECRET_DIR -name '*.env.enc'`; do
    gcloud kms decrypt \
      --plaintext-file=${file%.*} \
      --ciphertext-file=$file \
      --location=asia-northeast1 \
      --keyring=delay-tweet-test \
      --key=delay-tweet-json-cred
    log "Finish" "Decrypt $file to ${file%.*}"
  done

  log "Complete" "${TASK_NAME}"
}
