#!/bin/bash



FUNCTION_FILE=${WORKSPACE_ROOT}/scripts/functions.sh

# an command

# anコマンドの使い方の説明
function _help_(){
  echo "   Usage: an COMMAND [ARG...]"
  echo "   COMMAND:"
  grep -B 1 -E -e '^function\s_.*' ${FUNCTION_FILE}\
    | grep -E '(^#|^function)'\
    | sed -z 's/\nfunction\s_/:/g'\
    | sed -r 's/(\s|#)//g'\
    | sed -rE 's/_\W+\{$//g'\
    | awk -F ':' '{ printf "       %-20s%s\n", $2, $1 }'
}

# すべてのコンテナを起動します
function _up_(){
  local TASK_NAME='Start-up all product system'
  log "Start" "${TASK_NAME}"
  up
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

# すべてのシステムを再起動します
function _restart_(){
  local TASK_NAME='Stop all product system'
  log "Start" "${TASK_NAME}"
  down
  up
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
  docker exec -it product_nginx_1 nginx -s reload
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# dockerコンテナの一覧を表示します
function _ps_(){
  local TASK_NAME='Display docker container list'
  log "Start" "${TASK_NAME}"
  docker ps -a
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# direnvをセットアップします
function _direnv_(){
  ${WORKSPACE_ROOT}/scripts/install-direnv.sh
}

# nginxのためにmkcertでcertificationをセットアップします
function _mkcert_(){
  local TASK_NAME='Create a certificate with mkcert'
  log "Start" "${TASK_NAME}"
  load docker build -q --rm -t anoriqq/sandbox:latest ${WORKSPACE_ROOT}/sandbox
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "Build sandbox docker image"
  cleanDockerImage
  docker run --rm \
    -v ${WORKSPACE_ROOT}:/home/sandbox/workspace \
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

# 不要なdockerコンテナを削除します
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
  cd "${WORKSPACE_ROOT}/packages/$1"
  if [ $? -ne 0 ]; then exit 1; fi
  ${*:2}
  if [ $? -ne 0 ]; then exit 1; fi
  log "Complete" "${TASK_NAME}"
}

# utils

function log(){
  local LOG_TYPE=$1
  local MESSAGE=$2
  local EMOJI_CODE=$3
  if [ "$3" = '' ]; then
    case "${LOG_TYPE}" in
      "Run" ) EMOJI_CODE="\U1F680" ;;
      "Start" ) EMOJI_CODE="\U26A1" ;;
      "Finish" ) EMOJI_CODE="\U2728" ;;
      "Skip" ) EMOJI_CODE="\U1F4DD" ;;
      "Complete" ) EMOJI_CODE="\U1F389" ;;
      "Error" ) EMOJI_CODE="\U1F525" ;;
    esac
  fi
  local EMOJI=$(echo -e "${EMOJI_CODE}")

  local LIGHT_CYAN='\e[96m'
  local LIGHT_BLUE='\e[94m'
  local CYAN='\e[36m'
  local RESET='\e[m'
  printf "${LIGHT_CYAN} ${LIGHT_BLUE}%-16s${CYAN}%s${RESET}%s\n" "[${LOG_TYPE}] " "${MESSAGE}" " ${EMOJI}"
}

function cleanDockerImage(){
  if docker images -f "dangling=true" -q; then
    log "Skip" "Already cleaned"
  else
    load docker image rm "$(docker images -f "dangling=true" -q)"
    if [ $? -ne 0 ]; then exit 1; fi
    log "Finish" "Clean dangling images"
  fi
}

function po(){
  # @see https://github.com/Uynet/shelAnime
  # Copyright (c) Uynet https://twitter.com/uynet
  declare -a frame # フレームあたり23文字
  frame[0]=".ro   ｡(*ˊ~ˋ)/🌟        "
  frame[1]=" nO   ｡C*ˊ-ˋɔ۶=====⭐   "
  frame[2]=" Noω  ｡(*ˊ~ˋ)۶=-==-=★  "
  frame[3]=" NoW  ｡(*ˊ~ˋ)۶--- ~-☆  "
  frame[4]=" Now  ｡(*ˊ-ˋ)۶ ~   ・x  "
  frame[5]=" Now  ｡(*ˊ-ˋ)۶       ✦ "
  frame[6]=" Now  ｡(*-~-)و       + "
  frame[7]=" Now .c>⌄<๑っ,        . "

  frame[8]="   🌟 \(ˊ˘ˋ*)｡  Io     ."
  frame[9]=" ⭐===٩Cˊᗜˋ*ɔ｡  [Ooo    "
  frame[10]="★=-- ٩(ˊᗜˋ*)｡  LoOOIho "
  frame[11]="x- ~ ٩(ˊᗜˋ*)｡  Loαdｪη9 "
  frame[12]="+    ٩(ˊᗜˋ*)｡  Loading "
  frame[13]=".    ٩(ˊᗜˋ*)｡  Loading "
  frame[14]="     ٩(-ᗜ-*)｡  Loading "
  frame[15]="      .c๑>⌄<っ.Loading  "
  #٩و｡
  #ˋˊ
  #⌄ᗜ▿
  #๑⑉

  trap 'tput cnorm; exit 0' `seq 0 64`
  tput civis
  tput sc
  while :; do
    for (( i=0; i<${#frame[*]}; i++ )); do
      echo -en "\e[95m${frame[i]}\e[m"
      sleep 0.07
      tput rc
    done
  done
}

function load(){
  # ローディングアニメーション
  local COMMAND=${1}
  local ARGS=${*:2}
  if [ ! "${COMMAND}" ]; then exit 0; fi
  po &
  local LOAD_PID=$!
  ${COMMAND} ${ARGS}
  kill -INT ${LOAD_PID};
}

function up(){
  docker-compose up --build -d
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "docker-compose up"
  docker ps -a
  if [ $? -ne 0 ]; then exit 1; fi
}

function down(){
  docker-compose down
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "docker-compose down"
  docker ps -a
  if [ $? -ne 0 ]; then exit 1; fi
}
