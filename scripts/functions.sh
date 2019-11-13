#!/bin/bash



FUNCTION_FILE=${WORKSPACE_ROOT}/scripts/functions.sh

# an command

# help #
## anコマンドの使い方の説明 ##
function _help(){
  echo "   Usage: an COMMAND [ARG...]"
  echo "   COMMAND:"
  grep -B 2 -e "^function _${1}.*{$" ${FUNCTION_FILE}\
    | grep '^#'\
    | sed -z 's/\n##\s/:/g'\
    | sed -r 's/(\s|#)//g'\
    | awk -F ':' '{x = 20 - length($1); printf "     %-16s%s\n", $1, $2}'
}

# direnv #
## direnvをセットアップします ##
function _direnv(){
  ${WORKSPACE_ROOT}/scripts/install-direnv.sh
}

# utils

log(){
  MESSAGE=$1
  AN_COMMAND_COLOR="\e[36m"
  AN_COMMAND_RESET_COLOR="\e[m"
  echo -e "${AN_COMMAND_COLOR} ${MESSAGE}${AN_COMMAND_RESET_COLOR}"
}
