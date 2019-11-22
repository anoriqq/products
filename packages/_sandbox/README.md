## sandbox container!!
- This container bind the this workspace directory

## Use sandbox
- Edit `command` in ./sandbox/docker-compose.yml
- Then run this command
  ```sh
  $ docker-compose -f ./sandbox/docker-compose.yml up --build && docker container stop `docker container ls -aq` && docker container rm `docker container ls -aq`
  ```
- Or `an` command
  ```sh
  an mkcert
  ```

## example
- `delay-tweet`で`yarn install`したくなったときは､
  ```sh
  an sandbox an exec delay-tweet yarn install
  ```
