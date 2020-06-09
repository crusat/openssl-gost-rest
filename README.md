Based on `rnix/openssl-gost`. Great thanks!!!

# About

See my article about this: https://crusat.ru/blog/129-vhod-cherez-esia-s-gost-2012/

# Install

Add content of `docker-compose.yml` to yours.

Place files `pubkey.pem`, `key.pem` and `cert.pem` into `keys` directory.

Then run:

```
docker-compose up -d
```

# Using

Example with https://httpie.org

## Sign

Request:

```bash
http --form POST http://localhost:3000/sign/ body="test sign string"
```

Example output (simple text):

```text
iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH1ggDCwMADQ4NnwAAAFVJREFUGJWNkMEJADEIBEcbSDkXUnfSgnBVeZ8LSAjiwjyEQXSFEIcHGP9oAi+H0Bymgx9MhxbFdZE2a0s9kTZdw01ZhhYkABSwgmf1Z6r1SNyfFf4BZ+ZUExcNUQUAAAAASUVORK5CYII=
```

## Verify

Request:

```bash
http --form POST http://localhost:3000/verify/ body="test sign string" signature="iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH1ggDCwMADQ4NnwAAAFVJREFUGJWNkMEJADEIBEcbSDkXUnfSgnBVeZ8LSAjiwjyEQXSFEIcHGP9oAi+H0Bymgx9MhxbFdZE2a0s9kTZdw01ZhhYkABSwgmf1Z6r1SNyfFf4BZ+ZUExcNUQUAAAAASUVORK5CYII="
```

Example output (simple text).

If verification OK:

```Text
OK
```

or if failed:

```Text
FAIL
```
