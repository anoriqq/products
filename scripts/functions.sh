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
    | awk -F ':' '{printf "       %-16s%s\n", $1, $2}'
}

# direnv #
## direnvをセットアップします ##
function _direnv_(){
  ${WORKSPACE_ROOT}/scripts/install-direnv.sh
}

# utils

log(){
  LOG_TYPE=$1
  MESSAGE=$2
  EMOJI_CODE=$3
  if [ "$3" = '' ]; then
    case "${LOG_TYPE}" in
      "Run" ) EMOJI_CODE="\U1F680" ;;
      "Start" ) EMOJI_CODE="\U26A1" ;;
      "Finish" ) EMOJI_CODE="\U1F389" ;;
      "Skip" ) EMOJI_CODE="\U1F4DD" ;;
      "Complete" ) EMOJI_CODE="\U2728" ;;
      "Error" ) EMOJI_CODE="\U1F525" ;;
    esac
  fi
  EMOJI=$(echo -e "${EMOJI_CODE}")
  AN_COMMAND_COLOR="\e[36m"
  AN_COMMAND_RESET_COLOR="\e[m"
  printf "${AN_COMMAND_COLOR} %-16s%s%s${AN_COMMAND_RESET_COLOR}\n" "[${LOG_TYPE}] " "${MESSAGE}" " ${EMOJI}"
}
