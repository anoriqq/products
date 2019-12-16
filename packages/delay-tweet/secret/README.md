# 機密情報(secret)の管理

- production環境の機密情報はkmsで管理する暗号鍵を用いて暗号化したファイルをコミットする
- 暗号化された機密情報はCloudBuildで復号されてDockerイメージに焼かれる

```sh
# encrypt
an encrypt delay-tweet

# decrypt
an decrypt delay-tweet
```
