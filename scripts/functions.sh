#!/bin/bash



FUNCTION_FILE=${WORKSPACE_ROOT}/scripts/functions.sh

# an command

# help #
## anコマンドの使い方の説明 ##
function _help_(){
  echo "   Usage: an COMMAND [ARG...]"
  echo "   COMMAND:"
  grep -B 2 -e "^function _${1}.*{$" ${FUNCTION_FILE}\
    | grep '^#'\
    | sed -z 's/\n##\s/:/g'\
    | sed -r 's/(\s|#)//g'\
    | awk -F ':' '{printf "       %-20s%s\n", $1, $2}'
}

# direnv #
## direnvをセットアップします ##
function _direnv_(){
  ${WORKSPACE_ROOT}/scripts/install-direnv.sh
}

# mkcert #
## nginxのためにmkcertでcertificationをセットアップします ##
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

# cleanDockerImage #
## 不要なdockerイメージを削除します ##
function _cleanDockerImage_(){
  local TASK_NAME='Clean dangling images'
  log "Start" "${TASK_NAME}"
  cleanDockerImage
  log "Complete" "${TASK_NAME}"
}

# po #
## ローディングアニメーション ##
function _po_(){
  local TASK_NAME='Loading animation'
  log "Start" "${TASK_NAME}"
  load sleep 5
  echo -e ''
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

# ローディングアニメーション
function load(){
  local COMMAND=${1}
  local ARGS=${*:2}
  if [ ! "${COMMAND}" ]; then exit 0; fi
  po &
  local LOAD_PID=$!
  ${COMMAND} ${ARGS}
  kill -INT ${LOAD_PID};
}
