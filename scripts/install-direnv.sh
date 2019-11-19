#!/bin/bash

SCRIPTS_DIR=`cd $(dirname $0); pwd`
source ${SCRIPTS_DIR}/functions.sh



TASK_NAME='Installation of direnv'

log "Start" "${TASK_NAME}"

# Download of direnv binary to binary directory
BIN_DIR=${SCRIPTS_DIR}/bin
DIRENV_BIN_PATH=${BIN_DIR}/direnv
if [ ! -e "${DIRENV_BIN_PATH}" ]; then
  DIRENV_VERSION=2.20.0
  DIRENV_BIN_RELEASE=https://github.com/direnv/direnv/releases/download/v$DIRENV_VERSION/direnv.linux-amd64
  curl -L ${DIRENV_BIN_RELEASE} -o ${DIRENV_BIN_PATH}
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "Download of direnv binary"
else
  log "Skip" "Direnv binary already exists"
fi
chmod +x -R ${BIN_DIR}
if [ $? -ne 0 ]; then exit 1; fi

# Add direnv hook to shell
# @see https://github.com/direnv/direnv/blob/master/docs/hook.md
ZSHRC_PATH=~/.zshrc
if [ -e "${ZSHRC_PATH}" ]; then
  DRIENV_HOOK_ZSH='eval "$(direnv hook zsh)"'
  if grep -q "${DRIENV_HOOK_ZSH}" ${ZSHRC_PATH}; then
    log "Skip" "Zsh already has a Direnv hook"
  else
    echo -e "\n# direnv hook\n${DRIENV_HOOK_ZSH}" >> ${ZSHRC_PATH}
    if [ $? -ne 0 ]; then exit 1; fi
    log "Finish" "Add direnv hook to zsh"
  fi
else
  log "Skip" "Cannot found zshrc"
fi
BASHRC_PATH=~/.bashrc
if [ -e "${BASHRC_PATH}" ]; then
  DRIENV_HOOK_BASH='eval "$(direnv hook bash)"'
  if grep -q "${DRIENV_HOOK_BASH}" ${BASHRC_PATH}; then
    log "Skip" "Bash already has a Direnv hook"
  else
    echo -e "\n# direnv hook\n${DRIENV_HOOK_BASH}" >> ${BASHRC_PATH}
    if [ $? -ne 0 ]; then exit 1; fi
    log "Finish" "Add direnv hook to bash"
  fi
else
  log "Skip" "Cannot found bashrc"
fi

# Create .envrc file
ENVRC_PATH=./.envrc
if [ ! -e "${ENVRC_PATH}" ]; then
  touch ${ENVRC_PATH}
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "Create .envrc file"
fi

# Add settings to .envrc file
ENVRC_SETTINGS_PATH='export PATH=$PATH:./scripts/bin'
if grep -q "${ENVRC_SETTINGS_PATH}" ${ENVRC_PATH}; then
  log "Skip" "Envrc already has a PATH"
else
  echo -e "${ENVRC_SETTINGS_PATH}" >> ${ENVRC_PATH}
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "Add PATH to envrc"
fi
ENVRC_SETTINGS_WORKSPACE_ROOT='export WORKSPACE_ROOT=/home/anoriqq/workspace/product'
if grep -q "${ENVRC_SETTINGS_WORKSPACE_ROOT}" ${ENVRC_PATH}; then
  log "Skip" "Envrc already has a WORKSPACE_ROOT"
else
  echo -e "${ENVRC_SETTINGS_WORKSPACE_ROOT}" >> ${ENVRC_PATH}
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "Add WORKSPACE_ROOT to envrc"
fi

# Activation direnv
if direnv status | grep -soq 'Found RC allowed true'; then
  log "Skip" "Allready allowed direnv"
else
  direnv allow
  if [ $? -ne 0 ]; then exit 1; fi
  log "Finish" "allow direnv"
fi



log "Complete" "${TASK_NAME}"
