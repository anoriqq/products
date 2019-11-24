# 環境構築
- [ ] `Google Chrome`を適当にインストールする
  - [公式ホームページ](https://www.google.com/chrome/)
- [ ] `WSL 2`を有効化する
  - [公式インストールドキュメント](https://docs.microsoft.com/en-us/windows/wsl/wsl2-install)
    ```powershell
    # Make WSL 2 your default architecture
    wsl --set-default-version 2
    ```
- [ ] `WSL`で`Ubuntu`を利用可能にする
  - [公式インストールドキュメント](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
  - [Ubuntu - Microsoftストア](https://www.microsoft.com/ja-jp/p/ubuntu/9nblggh4msv6)
    ```sh
    # Display Distro version
    cat /etc/lsb-release
    # DISTRIB_ID=Ubuntu
    # DISTRIB_RELEASE=18.04
    # DISTRIB_CODENAME=bionic
    # DISTRIB_DESCRIPTION="Ubuntu 18.04.3 LTS"
    ```
- [ ] `docker`を`Windows`にインストールする
  - [公式インストールドキュメント](https://docs.docker.com/docker-for-windows/install/)
    ```sh
    # Display docker version
    docker version
    # Client: Docker Engine - Community
    # Version:           19.03.1
    # API version:       1.40
    # Go version:        go1.12.5
    # Git commit:        74b1e89
    # Built:             Thu Jul 25 21:21:05 2019
    # OS/Arch:           linux/amd64
    # Experimental:      false

    # Server: Docker Engine - Community
    # Engine:
    #   Version:          19.03.4
    #   API version:      1.40 (minimum version 1.12)
    #   Go version:       go1.12.10
    #   Git commit:       9013bf5
    #   Built:            Thu Oct 17 23:50:38 2019
    #   OS/Arch:          linux/amd64
    #   Experimental:     true
    # containerd:
    #   Version:          v1.2.10
    #   GitCommit:        b34a5c8af56e510852c35414db4c1f4fa6172339
    # runc:
    #   Version:          1.0.0-rc8+dev
    #   GitCommit:        3e425f80a8c931f88e6d94a8c831b9d5aa481657
    # docker-init:
    #   Version:          0.18.0
    #   GitCommit:        fec3683
    ```
- [ ] `Ubuntu`にgitをインストールする
  - 2.17.1以降
  - [公式ホームページ](https://git-scm.com/)
  - [公式インストールドキュメント](https://git-scm.com/download/linux)
    ```sh
    # Installing on Ubuntu
    apt-get install git
    git --version # git version 2.17.1
    ```
- [ ] `gcloud`コマンドをインストールする
  - [公式ホームページ](https://cloud.google.com/sdk/gcloud/)
  - [公式インストールドキュメント](https://cloud.google.com/sdk/docs/)
- [ ] `Ubuntu`の`~`ディレクトリ以下の任意の階層にリポジトリをクローンする
  - https://github.com/anoriqq/product
    ```sh
    # `~/workspaces`にクローンする場合
    cd ~/workspaces
    git clone git@github.com:anoriqq/product.git
    ls . # product
    cd ~/workspaces/product
    ```
- [ ] 開発に利用するターミナルに環境変数を設定する
  ```sh
  # product
  export LOCAL_PRODUCT_DIR=/home/anoriqq/workspace/product
  export PATH=$PATH:$LOCAL_PRODUCT_DIR/scripts/bin
  ```
