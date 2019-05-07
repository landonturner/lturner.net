---
title: Thotcon 0xA CTF Writeup
layout: blog-post.hbs
date: 2019-05-06
displayDate: April 06, 2010
collection: blog
description: This is a write-up of the Thotcon CTF put on by the token.wtf team. My team took first place for the second year in a row, which earned us a gold badge worth free entry next year.
---

[Thotcon](https://www.thotcon.org) is self-described as Chicago's Hacking
Conference. The community that runs the conference is run by a bunch of really
great people who are always excited and enthusiastic about hacking and infosec.
The glorious leader, c7five, has announced at least another 0xA years running
thotcon, so I urge you all to come next year to fight for second place in next
years ctf :)

[Jim Covert](https://jcovert.com) and I won last year, but this year we were
able to recruit a few more people. Patrick "YOLO" McDonald joined us for the
whole journey. Evan White was there for the first day and a half. We were able
to make a new friend part way through with a current student at UChicago
[Claude](https://twitter.com/__laudecay__).

We were able to take first place this year and were awarded with the coveted
gold badge.

![gold badge](/images/thotcon-0xa-gold.jpeg)

## Interacting with the API

#### Registration

This ctf follows a very familiar registration and token submission process.
Registering your username is a simple post to their api server

```bash
curl --header 'Content-Type: application/json' \
  -d '{"email": "email@example.com", "name": "RAMROD"}' \
  https://api.token.wtf/register
```

This returns some json with an id and a secret which will be used to
authenticate when claiming tokens.

#### Checking Scores

In order to check the score, a quick curl to `api.token.wtf/score` is needed.
By the end, there were enough teams to make the output jumbled so I wrote a
quick python formatter.

```python
#!/usr/bin/env python3

import requests
import json

req = requests.get('https://api.token.wtf/score')
print(req.text)

scores = json.loads(req.text)

print_str = '{:>20} '*3
print(print_str.format("name", "score", "tokens"))
print(print_str.format("="*20,"="*20,"="*20))
for s in scores:
    print(print_str.format(s["team_name"], s["score"], s["tokens"]))
```

#### Submitting Tokens

Tokens take the form of a UUID. They have some example code on their website
that we have used for the last several years to submit tokens. Essentially each
request must be cryptographically signed in order to verify your identity. When
a correct token is submitted, the api will return a `201 CREATED`, and
otherwise it will return a `406 INVALID`.

## Gimme Token

The first token is a gimme. It was given plainly on the website.
`93f4f193-62a5-4bec-acaa-f17322bdc65e` The instructions on getting to the next
stage were also given. The urls of all the stages follow this format
`https://token.wtf/stages/<stage number>-<sha256sum previous token>.html`.

*PRO TIP*: when using bash to do the hash, you can echo the key to shasum, but do
not forget the `-n` flag or else you will be also having the newline and that
will burn at least 10 minutes.

```bash
echo -n 93f4f193-62a5-4bec-acaa-f17322bdc65e | shasum -a 256
# 08f12daef7c0b48a4530c21fbfd713db8ae6cfda8e982799bd775adf76eeb636  -
```

So the next stage is located at
https://token.wtf/stages/1-08f12daef7c0b48a4530c21fbfd713db8ae6cfda8e982799bd775adf76eeb636.html.

## Not Really a Picture

You can hide things in pictures, I can hide things in pictures, Thotcon opers
DO hide things in pictures. They tweeted out a picture with a qr code on it. We
scanned it and it brought us that image hosted on their website.
[ambiguous.jpg](/images/ambiguous.jpg). After running `strings | awk
'length>10'` to take a look for the things hiding in this picture we found two
references `.untitled.txt`, `aaaaaaaaa.png` and what looks like maybe a pdf or
some other image.


```bash
strings ambiguous.jpg | awk 'length>10'
# ...
# .untitled.txt
# aaaaaaaaa.png
#   << /Type /Catalog
#      /Pages 2 0 R
#   << /Type /Pages
#      /Kids [3 0 R]
#      /Count 1
#      /MediaBox [0 0 600 444]
#   <<  /Type /Page
#       /Parent 2 0 R
#       /Resources
#        << /Font
#            << /F1
#                << /Type /Font
#                   /Subtype /Type1
#                   /BaseFont /Courier-New     >>
#            >>
#       /Contents 4 0 R
#   << /Length 55 >>
#     /F1 18 Tf
#     (AMAxYguiCAScumANeLCH) Tj
# ...
```

The picture itself provided us with the last clue we needed. The three
emojis in that image: 🔫🤐🇮🇹  GUNZIP IT. We spent
too long trying to figure out that it wasn't really gunzip we needed but unzip.

```bash
unzip ambiguous.jpg
# Archive:  ambiguous.jpg
#    skipping: .untitled.txt           need PK compat. v5.1 (can do v4.5)
#    skipping: aaaaaaaaa.png           need PK compat. v5.1 (can do v4.5)
```

After googling, turns out it's not really unzip we needed but 7z. Using 7z we
got to a point where it asked us for a password. Eventually, we discovered that
our password was this string `AMAxYguiCAScumANeLCH` which was embedded in our
image.

`.untitled.txt` had the content `flag: a6ad2799-8a51-4ddb-bb55-83504106106e`.

## Quake

https://token.wtf/stages/2-1cb88db26fd2d30eb312d9ddd732e2c6fc58373888279e40932b2deffec4a162.html

The clue for this challenge is `Spend some time in your FAVorite first person
shooter! Play!`. We immediately thought FAVicon. The link for play led us to a
full in-browser version of Quake 3. The favicon was changing every few seconds.
Using the network tab in Chrome we could see each was a number and I recorded
the following sequence.  I opened the inspector tab and recorded the following
infinite sequence of numbers.

`209 011 149 097 209 011 149 097 209 .... `

The four repeating numbers looked like an ip so we plugged `209.11.149.97` into
the multiplayer server. We knew we were on to something when it told us that we
had an invalid password. We found the password in the source code of the quake
page.

`// serverpass: EndgameSpoiler`

We played a game or two on the server and after a bit some bots appeared with
interesting names. We grabbed a screenshot.

![noob slayer 69](/images/NOOB_SLAYER69.jpg)

Eventually the arrangement `365ffb4c-4ef5-a030-5fa9-740f1518c336` resulted in
the successful token submission. I also mean-spiritedly changed my name to
something like `235d` to throw the other people off. I feel bad about doing it,
but also it was pretty obvious who were the bots and who were the assholes
because bots had 0 ping.

## Maths

https://token.wtf/stages/3-eccbfef060736326603848438ab4bc5e5c542aadff4d8495e005ee2d0ea09d75.html

The clue `Hope you did your homework. 0x03 dot 0x0E dot 0x7C dot 0x62 colon
0x539` looks a lot like a website. Going to `http://3.14.124.98:1337/` gave me
an error. We tried other browsers. Safari says it is using HTTP/0.9 and we got
the idea to try telnet or netcat. With telnet it was asking math questions.

```bash
telnet 3.14.124.98 1337
# Trying 3.14.124.98...
# Connected to ec2-3-14-124-98.us-east-2.compute.amazonaws.com.
# Escape character is '^]'.
# 1+1
# 2
# 1+2
# 3
# 1-1
# 0
# 100-1
# 99
# 0-1
# 01
# # INCORRECT! DISCONNECTED!Connection closed by foreign host.
```

We kept trying until we noticed that the math questions were repeating
themselves. After searching I found a great little scripting language named
`expect` where you spawn a process, it waits for an input, and then sends
whatever you want back over. I ended up with this

```bash
#!/usr/bin/expect

spawn telnet 3.14.124.98 1337

expect 1+1
send "2\r"

expect 1+2
send "3\r"

expect 1-1
send "0\r"

expect 100-1
send "99\r"

expect 0-1
send -- -1\r

expect 0*1
send "0\r"

expect 42/6
send "7\r"

expect sqrt(4)
send "2\r"

expect 2103%4
send "3\r"

expect "x=1; y=2; x+y"
send "3\r"

expect "a=666; b=2; a*=2; b+=3; a+b"
send "1337\r"
```

Once that worked, I copy pasted this loop of questions until I had around 2000
lines in my file. After running for a few seconds the script exited after
encountering an unexpected connection close accompanied by `# YOU WIN AT MATHS!
Secret Code: 28813502-6a08-40bd-90a5-79c22691852d`

I later tested expect with netcat and it worked as well. Expect is very useful!

## четвертый уровень (Fourth Level)

https://token.wtf/stages/4-cd22e9b35756bf2b94b1124ac72aee9a29966399b6e059e06516c2e7f749ee81.html

<iframe width="639" height="360" src="https://www.youtube.com/embed/UGAao4MRIu0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

This video has two voices both speaking in Russian. The main track turns into a
rickroll. In the background, you can hear another voice say letters and
numbers. We found a very nice Russian speaker who was able to help us with the
translation and also became a member of the team for the rest of our journey. I
am also now somewhat okay at counting to девять in Russian. We were able to use
the slowdown feature in youtube to help here.

Once we got it as close as we could, the operators realized that this challenge
was taking entirely too much time and allowed us to play mastermind with them.
We would show a key and they would tell us how many were wrong. This allowed us
to finally get the key `ac1b508f-f6eb-4108-8cb9-a5bd89d2d22b`.

## Puzzle and Rabbit Hole

https://token.wtf/stages/5-ef2d65833fdd88183bef3f61a7d21c19fae106c64735a4c010c59dc4cbf90366.html

We were given a physical puzzle and quickly and efficiently got it done. We
were in first place and we weren't going to lose our lead, so we took a picture of the
puzzle and quickly took it apart so no one else could see. We are dumb.

![puzzle](/images/puzzle.jpg)

As you can see the binary says `Flipit`.

```
01000110 # F
01101100 # l
01101001 # i
01110000 # p
01101001 # i
01110100 # t
```

The ctf organizers thought that it was hysterical that we destroyed the puzzle.
Once we recreated it again, we used the thotcon program to flipit. There was a
black light in the room because we could see a faint QR code on the back. It
was glowing in the dark paint.


![qr](/images/qrglow.jpg)

That qr code lead `4z8r.token.wtf`. Navigating to the site in a browser and it told us

`you didnt say the magic number - 23423`

We did the standard nmap of that server and found a whole ton of open ports.
We discovered hitting some of these ports resulted in a similar prompt with different numbers.
A short time later we realized what we needed to do. The magic number refers to the path of the url

```
http://4z8r.token.wtf -> http://4z8r.token.wtf/23423
```

That page simply outputs a number `2217` which we recognized as one of the open ports. Connecting to that
port gave us another magic number. Down the rabbit hole we went. While Jim was trying to do this by hand,
I wrote this short python script. It's a little messy, I know, but I was going quickly at the time.

```python
#!/usr/bin/env python3
import requests
import re

def get_magic_number(body):
    return re.findall('\d+', str(body))[0]

base = 'http://4z8r.token.wtf'

body = requests.get(base).content
print(body)
number = get_magic_number(str(body))
body2 = requests.get(base + '/{}'.format(number)).content
print(body2)
port = get_magic_number(body2)
print(port)

while True:
    url = base + ':{}'.format(port)
    print(url)
    body = requests.get(url).content
    print(body)
    number = get_magic_number(str(body))
    url = url + '/{}'.format(number)
    print(url)
    body2 = requests.get(url).content
    print(body2)
    port = get_magic_number(body2)
```

After watching the output for a bit we noticed the key pop out of the body

`2217<!-- 35251dc7-544b-4267-a91b-3db0c8842113 -->`

## Warp

https://token.wtf/stages/6-94cf08ba1bcbec4270946d0aff36634092008fc6f636bcaeef2013c002eb70dc.html

We were running out of time at thotcon so our organizers "warped" us and gave
us the last three challenges at once. Here we broke off. Jim took care of the
forensics puzzle which he details [here on his
blog](https://jcovert.com/thotcon-0xa/#part-b---forensics-examination). Claude went over the network
challenge.

## GradeCom Assembly

I took the GradeCom E N T E R P R I S E challenge. This is a similar challenge
to last year so I felt pretty comfortable doing it. Josh Krueger created an
entire assembly language and the goal here was to extract information hidden on
two data files using the assembly code given. The two relevant pdf instruction
files are [here](/assets/gradecom-asm.pdf) and
[here](/assets/EnterpriseManual.pdf). He mentioned that he is going to release
all the code he used for these challenges and when he does I will link it here.

Josh had set up a physical box with 5 usb ports on it, one COMMAND port and 4
memory ports labeled A, B, C and D. I learned that the first 512 bytes of a
flash drive inserted into the command drive would be run as the program. A, B
and C are read-only memory devices, and D was write only.

Before attempting to solve the puzzle, I needed to know I was structuring my
code, building the binaries, and flashing my thumb drives correctly. I wrote a
very simple program that writes a single byte `0x21`, or `!` to the print register.

```bash
# Load 0xD0 into Register A
LDA 0x21
# Write Word to Beginning of Print Buffer (uses all registers)
SAVW 0xC0 0x00
# Print the print buffer
PRN
```

I saved that to a file named `program.ass`, and used his compiler like this:

```bash
./vasm-tools/vasm-mach -in program.ass -out program.bin
```

I loaded up a thumb drive and unmounted all partitions on it so I could use `dd`
to push the files directly to the drive, but first I needed to zero out the drive
of unwanted data over the first 1024 bytes.

```bash
# zero out drive
sudo dd if=/dev/zero of=/dev/disk2 bs=1024 count=1
# flash program to drive
sudo dd if=./sdk/program.bin of=/dev/disk2
```

With the program loaded onto the drive, I plugged the thumb drive into the
program slot and was thankfully greeted with a `!`. Test successful.

The "security module" takes a key that I was able to find embedded on the
website `<!-- Blue Key: 2e090af9ff23e35240261e08769dd0df -->`. My first thought
was to load this data file up on a thumb drive 2 and load the password on
thumb drive 3. This was not the working solution because I ran out of thumb
drives. Here is how I converted that string into bytes to be put on the flash
drive anyway.

```bash
echo -n 2e090af9ff23e35240261e08769dd0df | xxd --plain -r > password.dat
```

Because I ran out of flash drives, I had to load the key into the program
itself and use the second flash drive as the data output.

To load the password into the program I used the same save word command as
before to load 4 bytes at a time. Once the password was loaded, I pointed the
security module to the correct memory location where the key was located. Then
I mapped the dat file to page 0x03 and the output drive to 0x04. Once
everything was set up, I decrypted page 0x03 onto page 0x04. Then all was
needed was to flush the data on drive D back to the physical device. Here is the 
full program

```bash
# Enable Security Module
SXS 0x01

# BLUE KEY 2e090af9ff23e35240261e08769dd0df
# Load the key into page 0x02
#
# Load four bytes at a time and save into
# page using the SAVE WORD command with the
# appropriate offset
LDA 0X2E
LDB 0X09
LDC 0X0A
LDD 0XF9
SAVW 0x02 0x00
LDA 0XFF
LDB 0X23
LDC 0XE3
LDD 0X52
SAVW 0x02 0x04
LDA 0X40
LDB 0X26
LDC 0X1E
LDD 0X08
SAVW 0x02 0x08
LDA 0X76
LDB 0X9D
LDC 0XD0
LDD 0XDF
SAVW 0x02 0x0C

# Set the encryption key to the beginning of page 0x02
SXKLOC 0x02 0x00

# Map the input data in port A to 0x03
DMAP 0x0A 0x03
# Map the thumb drive to save the output in port D
DMAP 0x0D 0x04

# Decrypt page 3 (our data) and copy to
# page 4 (our mapped output drive location)
SXDEC 0x03 0x04

# Flush all data back to the drive
DSYNC 0x0D
```

I then had to grab all the data off the flash drive with this command

```bash
sudo dd if=/dev/disk2 of=./blue-decoded.dat bs=512 count=1
xxd ./blue-decoded.dat
# 00000000: 48e2 c537 568f 2728 097b e204 243c 0221  H..7V.'(.{..$<.!
# 00000010: 207c 2074 6865 2046 4952 5354 2031 3620   | the FIRST 16
# 00000020: 6279 7465 7320 6f66 2074 6869 7320 7061  bytes of this pa
# 00000030: 796c 6f61 6420 6973 2074 6865 2047 5245  yload is the GRE
# 00000040: 454e 2064 6563 7279 7074 696f 6e20 6b65  EN decryption ke
# 00000050: 792e 2054 6869 7320 7061 796c 6f61 6420  y. This payload
# 00000060: 6973 2031 3038 2062 7974 6573 0000 0000  is 108 bytes....
```

We now had the key for the green drive `48e2c537568f2728097be204243c0221`.

I used the exact same methodology to get access to green.dat which gave
me this output.

```bash
xxd ./green-decoded.dat
00000000: 2020 2020 2020 2020 2020 2050 4550 4520             PEPE
00000010: 5349 4c56 4941 202d 2054 4841 5420 5249  SILVIA - THAT RI
00000020: 4748 5420 5448 4552 4520 4953 2054 4845  GHT THERE IS THE
00000030: 204d 4149 4c20 7c20 4772 6561 7420 4a6f   MAIL | Great Jo
00000040: 6221 2059 6f75 7220 546f 6b65 6e3a 2033  b! Your Token: 3
00000050: 3134 6164 6163 612d 3232 3163 2d34 6635  14adaca-221c-4f5
00000060: 382d 3839 3766 2d39 6564 6631 3633 6362  8-897f-9edf163cb
00000070: 3434 3020 7c20 4e4f 5720 4c45 5453 2054  440 | NOW LETS T
00000080: 414c 4b20 4142 4f55 5420 5448 4520 4d41  ALK ABOUT THE MA
00000090: 494c 202d 2047 4554 2054 4849 5320 4d41  IL - GET THIS MA
000000a0: 4e20 4120 534d 4f4b 4520 2020 2020 2020  N A SMOKE
```

This revealed our final key `314adaca-221c-4f58-897f-9edf163cb440`.

## Conclusion

Jim and Claude were able to put us 2 tokens past everyone else once they had
finished the challenges they were working on. Thotcon was a blast again this
year and we are looking forward to next year. I know now that I need to put
more flash drives, a black light and some other gear into my ctf kit.

Thank you for reading this, or otherwise, thank you for clicking the link and
scrolling to the bottom.


