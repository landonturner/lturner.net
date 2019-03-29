---
title: Signing and Encrypting with GPG
layout: blog-post.hbs
date: 2019-03-29
displayDate: March 29, 2019
collection: blog
description: Explore creating gpg keys on a Mac through the terminal. Sign and encrypt text with the key. Register the keys with a remote key service so people can verify your signatures.
---

Have you ever wanted to cryptographically verify that you were the one to sign a document

## Installing gpg

```bash
brew install gnupg
```

## Creating a Key

```bash
gpg --full-generate-key
```

Select `RSA and RSA (default)` and choose `4096`. If you ever want to use this
key to sign GitHub commits you need to use this configuration. Enter your
information. Add whatever you want for the comment; I chose to leave mine
blank.

## Viewing the Key

```bash
gpg --list-keys --keyid-format LONG
# /Users/landon/.gnupg/pubring.kbx
# --------------------------------
# pub   rsa4096/6827462004B422D2 2019-03-29 [SC]
#       E9B1D409A94B77AB2BF2F4D86827462004B422D2
# uid                 [ultimate] Landon Turner <MY_EMAIL>
# sub   rsa4096/4948C17DB8DCC4C9 2019-03-29 [E]
```

This command shows which keys are in your pubring.kbx. LONG is specified here
so we can see the id of the key. It is located after `pub  rsa4096/`. Mine is
`6827462004B422D2`.

## Signing a Message

I found [The GNU Privacy Handbook on
signatures](https://www.gnupg.org/gph/en/manual/x135.html) very helpful for
understanding what was going on.

There are a few ways to generate a signature for a message. If you pass in a
file, it outputs a file containing the signature into the same directory. If
you use stdin, it outputs to stdout. I will show several different commands for
producing signatures.

The clear signed message wraps the original message along with the signature.

```bash
echo 'I solemnly swear that I am up to no good.' | gpg --clear-sign
# -----BEGIN PGP SIGNED MESSAGE-----
# Hash: SHA256
# 
# I solemnly swear that I am up to no good.
# -----BEGIN PGP SIGNATURE-----
# 
# iQIzBAEBCAAdFiEE6bHUCalLd6sr8vTYaCdGIAS0ItIFAlydkqEACgkQaCdGIAS0
# ItL2cg//de17P3+SxJVeJeoeqTWgZA7DlXiRZ09/DM4NhaY9RSIKao/IKeKUZMyU
# ty7JDP8dSir6kJlqJHY/IL50RAPXSoURY0Zg9svGfbUrNZOzhDT1IdZypxsL1xch
# luYDan8+fGiXQrOM5FnC9Kadhh4FKNxHXzPXyBNmFuBlB76dX9YELMhJAoiF89Wm
# WMCJ7S0he6kJnlle1RDPFGEUUrueRS5I31M3XNZjbdRvlwesf0oydUCYgNJjH9c0
# kJIKi3HEEDz4pfd7nw3xrAFD9LTlzdgxORCbeb2L6ThlWQudU8r1qUFcaGMWsXk+
# GAlL5mqFQ2oAGOe8irhtkpz1WuTzaHeOdxMxEZvCf1TCwMqceBM8HQoHvsMmJqyL
# 2L95gzzH3i5r9ZXhMOtngBjsrz7P/hhiiA0I2smvd5farY0KyQ0HxzMnoFuAjI/u
# CidR/qsxxUmFChbrznBeuZRsMHqVBkJuPWBuTZSjccI6UDI97B5b/LBPcPj11aTM
# rgOqlkT1VPiKaGUimgQwcMmtZM3EIpBDhhgiwED3gEjtl28pYF4kaQANClKU3Xg2
# Oj1VDyU9K3R+gpx6rQcAS3HIIYAVPG/q+S3JTz64rEs9H3K3Yo95hL8yTHSHnLXR
# xXyzRS4i4tye8rT+UMIBe2IVwmwcj5ISzvmBRqoxka4hN+Upc6Y=
# =/H0q
# -----END PGP SIGNATURE-----
```

In the next command, the `-a --armor` flag creates the nice ASCII version of
the signature. Without `-a` it outputs binary into the terminal. I will use
this flag throughout the rest of the post, as it works all gpg commands.

```bash
echo 'I solemnly swear that I am up to no good.' | gpg --sign --armor
# -----BEGIN PGP MESSAGE-----
# 
# owEBdwKI/ZANAwAIAWgnRiAEtCLSAcswYgBcnZK+SSBzb2xlbW5seSBzd2VhciB0
# aGF0IEkgYW0gdXAgdG8gbm8gZ29vZC4KiQIzBAABCAAdFiEE6bHUCalLd6sr8vTY
# aCdGIAS0ItIFAlydkr4ACgkQaCdGIAS0ItI6qw//Y5IwPOL0XrKlD/zM/nbt0C7k
# 2mJuY/PVH7nFM4wr/HpJwPHJX44rSXynOKwkBkMasuE3PFnFf9EB40iRTmtIKUMw
# dVj7yXiqn0KVlBc4s0D7jTaml4cGJpb+xR/1yqjp5OMqEsWgtPgItONYbSfKkWHV
# kdf6Ib/8jYYNxjoPLS+nJTdaGt84/lHnanslAK6/91d0JK34LZF53EDXH+zE89uA
# Z9rnVwX+T791Gi5XtEd1FEo+m8uGyW311ktklF/+hIVl7DpCWmGnPBDr1Vu6z1I3
# SNwcqAPXHz4/1Rhp4gvSn0ckUNe82xwZgz9pdrFFQo0YuCLXx6f2rqH0RptwrS47
# laa9vm2Gou/Yz7352qfnVIwgyYGF7gA2bOLOR7wY+FS2KezpZzB9vEwhfdOU7ecA
# j3Bk5oG2Bnn3+wmOMarQ4+rsJVFS3kQNUB9IsMCIdLbUwIFFU8gHE5SA5erOyoKd
# Ok4375Kh7DjBe2wPiBohvQLK0eaUU2ZYuQmWC2k6u1e6O4gT7rocePGqqOqEpaEO
# u6bDwWra2YUI5wlWifsnOeaQrPKnfCJiJEiMGioqt9OfKs+dVKFuPYtQpHjnrrJ2
# qnjuOO3UMWdK21EDoTKgXc2TuhH7Xp752Oya3K0g6PVlP4tI8xLdj8WMqEy7VjAW
# mewOVOMewnDW+ZA+yZQ=
# =sbgw
# -----END PGP MESSAGE-----
```

Run the same command, but output to a file. We can verify and reconstruct our
message with this file.

```bash
echo 'I solemnly swear that I am up to no good.' | gpg -sa --output message.sig
```

When using the `-s --sign` flag, the message is also embedded in the signature.
You can verify the signature and recover the message with the following
commands.

```bash
gpg --decrypt message.sig
# I solemnly swear that I am up to no good.
# gpg: Signature made Thu Mar 28 22:55:34 2019 CDT
# gpg:                using RSA key E9B1D409A94B77AB2BF2F4D86827462004B422D2
# gpg: Good signature from "Landon Turner <MY_EMAIL>" [ultimate]
```

The signature does not have to be embedded in the signature, however. Using the
flag `--detach-sign` you can create just the signature.

```bash
echo 'I solemnly swear that I am up to no good.' | gpg --detach-sign -a
# -----BEGIN PGP SIGNATURE-----
# 
# iQIzBAABCAAdFiEE6bHUCalLd6sr8vTYaCdGIAS0ItIFAlydmNEACgkQaCdGIAS0
# ItJStA//UbJUmFoK0z9ubGEibtZUbRKArxnbyDQ+ky8APo4nIEbq6K3sKRR5I1GS
# 3ofgGnGC9nF+JbZ00CFSsOi2CI1iLlxXjd1uYrqhLTbCwNnYzCykMcbt0ZP6K6rY
# pLAPSLfCGHikS0eth1UfBLZoWNAmVXCFb2LxkNRcbjQFRCp5yamBeye9N5yDbJ7v
# eBstgq79rnHUyBAhYjsFX9++Jb7je4T1juTjXD+JcPu0qOR3wznGNbI9b84yF44/
# nd7NZpL5+NJqyTc9ZvfP5cQ9nUTHyuvgwkHJZVHAgJIb3HEjcgbhtsaO7zHvCRBr
# l0MhXOSyvSfFwmsEyh7j9S5HqZ4WYpNN8IFhR7KgreTGoTPOvXySOrsNY0kF4L1w
# DdmbL6z8ygXa52FZSV61THNnB3aIu3H03YHJ5has2BihGsKL1OkZYZww1FewyOb+
# wsWsh3CM8UAuInW6ETM6Rhhdmsyi51bAXv6I5C8NqvvjBTO8vjt0qdPS4oazazsG
# 50h84B49+X1jK2KWg+oYsS9uXBS8GGrJmO//JeCYZArCxQJwbjel5FPyCKdVwDOs
# Eb32TMXCGsm3kxsuzf9BilC7B5MPjw9rh6d1EN0bi4y65WTIzBWOB17S/9/6Z3sz
# 7fVzfuFFlZgDEAh5cpZ4ZXfnRqM7uQybrgfgBwCda+mKsM73HAs=
# =P5rp
# -----END PGP SIGNATURE-----
```

```bash
echo 'I solemnly swear that I am up to no good.' > message.txt
gpg --detach-sign -a --output message.sig message.txt
gpg --verify message.sig message.txt
# gpg: Signature made Thu Mar 28 23:05:57 2019 CDT
# gpg:                using RSA key E9B1D409A94B77AB2BF2F4D86827462004B422D2
# gpg: Good signature from "Landon Turner <MY_EMAIL>" [ultimate]
```

## Encrypting a Message

There are two basic types of encryption,
[symmetric](https://en.wikipedia.org/wiki/Symmetric-key_algorithm) and [public
key](https://en.wikipedia.org/wiki/Public-key_cryptography). With symmetric
encryption, you take a key and encrypt a message. Whoever has that key can
encrypt it. While you _can_ use gpg to encrypt (see the flag `-c --symmetric`),
this post is about using the keys generated earlier.

A key pair is made up of a private and public key. The public key is used to
encrypt the message that only the private key can decrypt. As the names
suggest, the public key is safe to hand out to the world, but the private key
should never be given out. When you give out your public key, you enable anyone
to encrypt messages only you can decrypt.

#### Generating a Public Key

```bash
gpg --export -a MY_EMAIL
```

#### Importing a Public Key

If you are trying to encrypt a file for someone else, you need their public
key. To import it, use the following command `gpg --import public_key.gpg`. The
key will be listed in your keychain when you run the command `gpg --list-keys`.
When you run this command you will be shown their email address. This is used
to specify who you are encrypting for.


#### Encrypting Using a Public Key

I found [The GNU Privacy Handbook on
encryption](https://www.gnupg.org/gph/en/manual/x110.html) very helpful for
understanding what was going on. You can include multiple recipients, and if
you include your own, you will be able to decrypt it as well.

```bash
echo 'I solemnly swear that I am up to no good.' > message.txt
gpg --encrypt --output msg.gpg --recipient OTHER_EMAIL --recipient MY_EMAIL
```

#### Decrypting the Message

```bash
gpg --decrypt msg.gpg
# gpg: encrypted with 4096-bit RSA key, ID 4948C17DB8DCC4C9, created 2019-03-29
#       "Landon Turner <MY_EMAIL>"
# gpg: encrypted with 4096-bit RSA key, ID F3B7D450F6DB041A, created 2019-03-26
#       "Landon Turner <OTHER_EMAIL>"
# I solemnly swear that I am up to no good.
```

## Using a Keyserver
There are websites that are gpg key repositories. You can upload your public
key safely because there is no risk in exposing your public key. The [wiki on
key
servers](https://en.wikipedia.org/wiki/Key_server_%28cryptographic%29#Keyserver_examples)
has a good list of key servers to use. I used the MIT keyserver.

One thing that struck me as strange is I did not have to verify with the
keyserver that I was the one who owns this email. I would think an added
security step would be email verification so that I couldn't go making the
email tim@apple.com and tricking people into thinking I was Tim.

*Note. The following commands were not working on my mac but were working on a
remote centos instance. I will come back later and link the stack overflow that
has my answer.*

#### Registering Your Keys

```bash
gpg --send-keys --keyserver pgp.mit.edu 6827462004B422D2
# gpg: sending key 6827462004B422D2 to hkp://pgp.mit.edu
```

#### Pulling Keys From Server

The following command will register my key in your keychain. You can use this
to tweet encrypted messages at me if you wanted, or verify the signature of
this post.

```bash
gpg --recv-keys --keyserver pgp.mit.edu 6827462004B422D2
```

## Using With GitHub

You can [upload your key to
GitHub](https://help.github.com/en/articles/adding-a-new-gpg-key-to-your-github-account),
[register your key ID with
git](https://help.github.com/en/articles/telling-git-about-your-signing-key),
[then sign your commits](https://help.github.com/en/articles/signing-commits)
using the `-S` flag. You can be certain the commit for this post was signed.

_note: the following signature is built from the markdown file located in the
github repo without the signature included._

```
-----BEGIN PGP SIGNATURE-----

iQIzBAABCAAdFiEE6bHUCalLd6sr8vTYaCdGIAS0ItIFAlyeUGQACgkQaCdGIAS0
ItKxWw//ZHpsr0DskQuC9jcJxom8weJtRY1vqGCEBHqG8dSvMrS3YJFs6Lu2Abe6
olqoofZaB0tanXKtJ/Eb22rtLmKu0aZazzFqr8gFLpIMisdh6U6jIkmxY79Pxkrw
JP5DhEqiEegP49lK29q+z2u8PfGcM2Nwvig9oMKth8j2iJ5fEsCMC2oo8q04LOLW
A+blWDaaBmWmtHumxUJ7R5TZUNws2LYA8KGZx6DwxICe7jdt7VSBhznGHzCW1h7L
PUJQOC/3rR3xTDRdkCdMznoqIrBFQMZ4HamNIQdocw54SBjegD1dkB5csEVbGPNK
HO9MehIEwJEeH2/jd5BYggxt2haPM41ENKJejLkeb1va0s6cl2eik8mUvKSE1AuC
rLtNfiVrQajE9nKl+y+L3TYV94GbIoHaBSBv/+aT0IHr2yqqa7UuksA8J0Tw46Su
HrBVnzopePUMy66oBwKKcTlB/3vSQE97r4UHqgdLckgdREitOdzrNavlGQhqci+Q
fzSFmHwTmXiSEwJAz6e+C6/o4mKhTCHxXnRT068tPWCL99xKVvQoMkbPYafgSptQ
KeoX1vnKvOZzmFs6EOcL9DmNq2fkxUA2272y2uSeKOTqmFwK2LXeX3O9zx55rPTN
t5q2OWUycEl51AgYjYr8avta+h8hEcvw41sKONqkmtwJFx7Z8y4=
=EKz8
-----END PGP SIGNATURE-----
```
