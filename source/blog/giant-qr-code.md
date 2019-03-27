---
title: Giant QR Codes
layout: blog-post.hbs
date: 2019-03-27
displayDate: March 27, 2019
collection: blog
description: Building a gigantic qr code using python and kinkos. This code generates a qr code, splits it into NxN segments and puts it in a pdf for easy printing. 
---

Have you ever wanted to print a gigantic qr code that people could scan from
a moving train? Me too. Here I will discuss the steps, costs, and methods on
how to do this.

Take a peek at [this repo](https://github.com/landonturner/giant_qr_code) for
a sneak peak.

![giant qr code](/images/qr_code_done.jpeg)

## Python code

I used several libraries to help do this, although it might be interesting in
the future to inline the steps and just use
[PIL](https://github.com/python-pillow/Pillow). It is somewhat messy now,
because each step writes the image files to disk and reads files from the
previous step.

### Generating the QR Code

There were a few libraries, but I eventually landed on using
[qrcode](https://github.com/lincolnloop/python-qrcode). It has a lot of great
features and has 2k+ stars on github. Easy choice. At first I thought I
needed to have a library that could output vector so that I wouldn't have any
artifacts when scaling the image up to the size needed. I found this to be a
pain in the ass. None of the other libraries are able to support vectors in
any meaningful way so I quickly abandoned that idea and just generated a png
that is large enough to not really matter.

```python
# creates a qr code
qr = qrcode.QRCode(
    box_size = 200,
    border = 0,
)

qr.add_data("i'm a little qr code, short and stout")
qr.make(fit=True)

img = qr.make_image()
img.save("full.png")
```

This produces a file named "full.png" that is an 8.6k png image with a
resolution of 4200x4200. This is plenty big for our purposes. I used 0 border
because I will take care of margins when creating the pdf file.

### Splitting the QR Code

The next step is to split the qr code into tiles that can be printed onto
separate pieces of paper and assembled later. I found a library named
[image_slicer](http://samdobson.github.io/image_slicer/) that splits an image
into 9 equally sized tiles. This produces square images given our square
input. Further development here with a rewrite or fork of this library could
save a bit of paper by making each slice take up a full sheet of paper, but
that's an overeager optimization for what I wanted to do.

```python
# slices image and organizes filenames
tiles = image_slicer.slice('full.png', 9)
image_names = [tile.filename for tile in tiles]
image_names.sort()
```

This produces 9 files, `full_01_01.png, full_01_02.png, ..., full_03_03.png`.
Each file is a 1400x1400 square section of each file. This also organizes the
filenames for the next step. Unfortunately, the pdf library requires paths to
files. I would have preferred not saving these to disk and passing the image
object from the tile instead.

### Assembling a PDF

This was one of the more annoying parts. I spent too long trying to make it
work without saving every image from the previous step and finally gave up. I
ended up landing on [fpdf](https://github.com/reingart/pyfpdf). It is pretty
straightforward to set up the page. I created .75 inch margins (this value
was arbitrary) by placing our image square image at x=0.75 and y=0.75 and
giving it a size of 7in x 7in. Then to track which page is which, I print the
file name below the QR image.

```python
 # create the pdf and insert each images as a new page
 pdf = FPDF('P', 'in', 'Letter')
 for file in image_names:
     pdf.add_page()
     pdf.image(file, 0.75, 0.75, 7, 7)
     pdf.set_font('Arial', 'B', 16)
     pdf.text(x=0.75, y=9, txt=file)
     pdf.text(x=0.75, y=9.5, txt="i'm a little qr code short and stout")
 pdf.output("full.pdf", "F")
```

This means that the final QR code images can only be done in increments of 7 inches. You can do a 7x7, 14x14, 21x21, 28x28, ... etc with this code.

#### Note

I assembled all of these steps with a couple of command-line options (like
how wide, cleanup, and width in pieces of paper) [in the github](https://github.com/landonturner/giant_qr_code)

## Assembly

I printed our nine pieces of paper at Kinkos for about $2. After I printed
the pictures, I cut each sheet very carefully around the border of the qr
code with the paper slicer there, labeled each slice with a post-it note to
remember which position it was and took it home for assembly with tape.

![qr code under construction](/images/qr_code.jpeg)

## Summary

This worked great. I was able to print my huge qr code. The process is very
repeatable and easy to do. I mentioned a few improvements that could be made,
but overall this thing works.