# reference_image.md — one illustration for a post that has none

**Who this file is for:** an AI model, attached **together with `reference_blog.md`**
when the author's draft comes with no images. Follow `reference_blog.md` for the
post. Follow this file to add exactly one illustration slot to it and to write
the prompt the author will paste into an image model (Google's Nano Banana by
default) to create the file.

The author does not draw, does not edit the prompt, and does not choose colours.
You decide all of that here so every post on the site looks like it came from the
same hand.

---

## 0. For the human

Attach this file alongside `reference_blog.md`, your draft, and nothing else.
Send `Title: <your title>` as usual. The output includes a section headed
**Image to generate**. Then:

1. Copy the prompt from the fenced block into Nano Banana (the Gemini app, or
   Google AI Studio), or into any other image model.
2. Check the result against the six-line checklist in §7. Regenerate if it fails.
3. Save it as PNG under the **exact filename** given, into the post folder.
4. If the file is over about 500 KB, compress it at squoosh.app (OxiPNG, or
   WebP at quality 80; if you switch to WebP, change the extension in `index.md`).
5. Only then branch, commit and open the PR. The post already references the
   file, and **the build fails, naming the file, until it is in the folder.**

To skip the image on a post, add a line `Image: no` to your prompt. To get one
even though you attached your own images, add `Image: yes`.

---

## 1. When this file applies

| Situation | What you do |
|---|---|
| No images attached, no `Image:` line | Specify **exactly one** illustration (this file). |
| No images attached, `Image: no` | Specify none. Follow `reference_blog.md` alone. |
| Images attached, no `Image:` line | Specify none. The author's images are the figures. |
| Images attached, `Image: yes` | Specify one, placed as §3 says, in addition to theirs. |

Never more than one generated image per post. Illustrations decorate; tables,
code and the author's own figures carry the argument. Every image costs load time
on a site built to be fast, and a second illustration adds nothing a first did not.

---

## 2. The hard line: what a generated image may and may not be

**It may be** a conceptual illustration of the method or of the failure the method
catches. Abstract, geometric, metaphorical. It shows the *idea*.

**It may not be, or contain, any of these:**

- A chart, graph, histogram, heatmap, equity curve, drawdown curve, candlestick,
  bar chart, scatter plot, table, dashboard, report page, spreadsheet, terminal
  or platform screenshot, or anything with **axes, tick marks, gridlines or a
  legend**.
- **Text of any kind**: letters, words, numbers, percentages, dates, tickers,
  currency symbols, formulas, labels, captions inside the image.
- A real or invented company name, logo, product, app interface or brand mark,
  including ours.
- People, faces, hands, silhouettes.
- Finance clichés: bulls, bears, rockets, coins, banknotes, dollar signs, piggy
  banks, safes, handshakes, city skylines, trading floors, "AI brains", circuit
  boards, glowing neon grids.
- Photorealism or 3D renders.

**Why the line is where it is.** An image model that draws a chart draws
*fabricated data*. Its axis numbers are invented, its curve is invented, and on
a page whose entire pitch is that every number is computed and checked, a made-up
curve is both a credibility failure and a breach of the positioning rule: a
generated equity curve reads as a performance claim we did not compute and cannot
stand behind. Text in generated images is also unreliable and often misspelt. So
the image is never asked to carry information. It carries a shape that helps the
reader hold the idea.

**Disclosure.** The caption always states the image is an AI-generated
illustration and is conceptual, not data (§6). Do not remove or crop any
watermark the generating tool adds.

**Never use the image as a stand-in for a figure the draft describes but did not
supply.** That gap is handled by `reference_blog.md` (write the finding as a table
or sentence; flag it). The illustration is a separate, decorative element.

---

## 3. Where it goes in the post

After the opening paragraphs and **before the first `##` heading**. It sits under
the lede as the post's one visual, the way a magazine feature opens.

```markdown
<opening paragraph>

<second opening paragraph, ending with what the post is about>

![<alt text>](./<file-name>.png "<caption>")

## The problem
```

Not in the FAQ, not inside a list, not next to a table, not beside the author's
own figures.

---

## 4. The visual system

Every illustration on the blog follows this, so the blog reads as one site and
not as a collage of stock art. Bake all of it into the prompt.

### Background

Uniform, flat **near-black `#08090B`**, the page background. The image's edges
should disappear into the page. No vignette, no gradient, no texture heavier than
a faint paper grain. The page rounds image corners by 9px, so nothing important
sits within about 4% of any edge.

### Ink

- Primary shapes and lines: **off-white `#F4F6F8`**.
- Secondary or receding elements: **grey `#6B7480`** or `#A3ABB6`.

### Accent: exactly one scheme per image

- **Default, one idea highlighted:** **lime `#C6F24E`** on the single element that
  carries the point. Nothing else coloured.
- **Two things contrasted** (honest versus flattering, in-sample versus
  out-of-sample, signal versus noise, kept versus destroyed): **blue `#3987E5`**
  for the validated or honest one, **red `#E5484D`** for the flattering, broken or
  lossy one. **No lime** in this case.
- Never all three colours in one image. Never any other hue.

These are the site's own tokens: lime is its UI accent, blue and red are the
colours its sample report uses for positive and negative data. An illustration
that borrows them looks like it belongs to the report next to it.

### Style

Flat, editorial, restrained. Thin precise strokes, simple geometric forms,
generous negative space. Think of the drawn diagrams in a serious technical
book, not a marketing hero image. A faint paper grain is fine. No glow, no lens
flare, no depth-of-field blur, no drop shadows, no gradients, no 3D, no
photographic textures, no "neon cyberpunk", no watercolour.

### Composition

- **One metaphor, one idea, legible at 300px wide** (a phone). If it needs
  studying, it has too much in it.
- Landscape **16:9**.
- Subject centred or on the horizontal thirds, with wide quiet margins.
- Fewer than about a dozen distinct elements. Repetition of one simple element
  (tiles, ticks, frames) is good; variety is noise.

### Output size

The column displays the image at about 680px wide. Anything from 1024px to
1600px wide is right. Whatever size the tool produces, do not upscale it.

---

## 5. Deriving the metaphor from the article

This is the part that makes the image *about this post*. Work from the post you
have just written, not from the title alone.

1. **Find the one idea.** The last sentence of the opening paragraphs states
   what the post is about. Start there.
2. **Name the mechanism.** What does the method physically do? Cuts a strip into
   runs. Slides a window along a line. Removes the neighbours of a test window.
   Threads a curve through points. Shrinks an estimate toward zero. Sorts a band
   into three textures.
3. **Name the failure it prevents.** Clusters scattered. A curve that touches
   every point. Information flowing backwards across a boundary. A target hit
   off-centre.
4. **Choose a visual metaphor for the mechanism**, and if the post contrasts a
   right way and a wrong way, show both with the blue/red scheme. Otherwise show
   the mechanism alone with the lime accent.
5. **Strip it down.** Remove every element the metaphor survives without.

Examples, from method to picture:

| Post is about | Mechanism | Picture |
|---|---|---|
| Block bootstrap vs single-trade shuffle | Cutting a sequence into runs and reassembling | A strip of small tiles with a few tight red clusters; below, the strip cut into segments with thin blue cut marks, reassembled, clusters intact |
| Overfitting / too many parameters | Fitting a curve to noise | A cloud of grey dots; a red line writhing through every dot; a blue line passing smoothly through the cloud |
| Walk-forward optimisation | A window stepping along time | A long horizontal line; a sequence of identical frames stepping along it, each overlapping the last; the leading frame in lime |
| Purged and embargoed cross-validation | Removing neighbours of a test window | A horizontal band of tiles; one lime block in the middle; the tiles on either side of it faded to grey with clear gaps |
| Deflated Sharpe / multiple testing | Shrinking one result against many trials | Many faint thin bars of similar height; one bar raised and in lime; a thin off-white line marking where it settles after shrinkage, lower |
| Regime analysis | Sorting a series into states | A single horizontal band divided into three stretches of different simple texture: dense hatching, sparse dots, plain |
| Look-ahead / leakage | Information crossing a boundary backwards | A vertical hairline; small grey marks flowing left to right; one red mark crossing it the wrong way |
| Slippage and costs | The fill landing away from the intended price | A set of thin concentric rings in off-white; a lime dot at the centre; a red dot displaced to one side, with a short hairline between them |
| Parameter sensitivity | Neighbouring settings behaving alike or not | A grid of small squares, mostly off-white, with one smooth blue plateau and one isolated red spike |

Do not reuse a picture already used by another post. The seed post's
illustration, if one is ever generated, is the first row of this table.

---

## 6. Alt text, caption, filename

These three go into `index.md` and are linted like the rest of the prose. They
must pass every rule in `reference_blog.md` §2.

**Alt text.** One sentence, what is depicted, for a reader who cannot see it.
Concrete shapes, not the concept. Do not start with "Image of" or
"Illustration of".

> A strip of small tiles with a few tight red clusters, cut into segments and
> reassembled below with the clusters intact.

**Caption** (the quoted title). Two parts, in this order: one sentence saying
what the metaphor stands for, then the fixed label.

> Resampling in blocks keeps runs of losses together. Illustration, AI-generated;
> conceptual, not data.

The label **"Illustration, AI-generated; conceptual, not data."** is fixed. Use
it word for word on every generated image.

**Filename.** Lowercase kebab-case, names the metaphor, ends `-illustration.png`.

> `block-resampling-illustration.png`

---

## 7. Writing the prompt

Nano Banana (Gemini's image model) responds best to **one descriptive paragraph
in plain prose**, not a keyword list. State what is there, how it is arranged,
the style, the exact colours, what must be absent, and the aspect ratio, all in
the same paragraph. Give colours as **hex and in words** ("near-black
`#08090B`"), because some models ignore hex. Say "no text" explicitly and
early; text is the most common failure.

Length: 80 to 150 words. One paragraph. No line breaks inside it.

### Template

Fill every bracket. Remove the brackets.

```
A minimalist editorial illustration for a technical article about [the one idea, in plain words]. [The metaphor: what is in the frame, how many, where, in what arrangement — two or three concrete sentences]. Flat vector style with thin, precise lines, simple geometric forms and generous empty space, with a very faint paper grain. The background is a uniform near-black (#08090B). Shapes and lines are cool off-white (#F4F6F8) and soft grey (#6B7480), with [EITHER: a single accent of lime green (#C6F24E) on the one element that carries the idea, the {element} / OR: blue (#3987E5) for the {honest thing} and muted red (#E5484D) for the {flattering or broken thing}, and no other colours]. No text, no letters, no numbers, no axes, no charts, no logos, no people, no candlesticks, no coins. Landscape 16:9, subject centred with wide margins, composed to sit quietly inside a dark web page.
```

### Filled example (the seed post, "Why we resample blocks of trades, not single trades")

```
A minimalist editorial illustration for a technical article about resampling trades in blocks rather than one at a time. A single horizontal strip of small square tiles runs across the upper middle of the frame like a film strip; most tiles are cool off-white and a few sit in tight clusters of three or four muted red tiles, representing runs of losses. Below it, the same strip has been cut into short segments of five or six tiles and reassembled in a different order, with thin blue cut marks between the segments, so that each red cluster stays intact inside its segment. Flat vector style with thin, precise lines, simple geometric forms and generous empty space, with a very faint paper grain. The background is a uniform near-black (#08090B). Tiles are off-white (#F4F6F8), cut marks are blue (#3987E5), the loss clusters are muted red (#E5484D), and there are no other colours. No text, no letters, no numbers, no axes, no charts, no logos, no people, no candlesticks, no coins. Landscape 16:9, subject centred with wide margins, composed to sit quietly inside a dark web page.
```

### Always supply a fallback

Image models add clutter. Provide a second, **simpler** prompt with the same
palette and one fewer idea, for the author to use if the first result is busy or
grows text. In the example above the fallback would drop the top strip and show
only the reassembled segments.

### Other tools

The same prompt works in ChatGPT/DALL·E, Ideogram and Adobe Firefly pasted as
is. For Midjourney, append ` --ar 16:9 --style raw` and expect hex codes to be
ignored, which is why the colours are also named in words. For Stable Diffusion
based tools, move the "No text, no letters…" sentence into the negative prompt
field.

---

## 8. What you deliver

In addition to everything `reference_blog.md` §11 asks for:

1. **In `index.md`:** the image line, placed as §3 says, with the alt text,
   filename and caption from §6.
2. **A section headed `Image to generate`**, after the folder and before the
   Notes, containing in this order:

   ```
   File:      <file-name>-illustration.png   → save into the post folder
   Position:  after the opening paragraphs, before "## The problem"
   Size:      landscape 16:9, 1024–1600px wide, PNG, under 500 KB
   Alt:       <alt text>
   Caption:   <caption>

   Prompt (paste into Nano Banana or any image model):
   ```<the prompt>```

   Fallback prompt, if the first result is cluttered or contains text:
   ```<the simpler prompt>```

   Check the result before saving:
   - no text, letters or numbers anywhere
   - background is flat near-black, edges vanish into a dark page
   - one accent scheme only (lime alone, or blue + red), nothing else coloured
   - no chart, axes, gridlines, people, logos or finance clichés
   - one clear idea, still readable when the image is 300px wide
   - nothing important within 4% of the edges
   ```

3. **In the Notes block:** the line
   *"Generate `<file>` and save it into the folder before pushing. The post
   references it and the build fails until it exists. To drop the image instead,
   delete its line from `index.md`."*

---

## 9. Self-check before delivering

- [ ] Exactly one image line in `index.md`, or none if §1 says none.
- [ ] It sits after the opening paragraphs and before the first `##`.
- [ ] Filename is lowercase kebab-case ending `-illustration.png` and matches the `File:` line exactly.
- [ ] Alt text describes shapes, one sentence, no "Image of".
- [ ] Caption ends with the fixed label, word for word.
- [ ] Alt text and caption pass every regex in `reference_blog.md` §2.1.
- [ ] The prompt is one paragraph, 80–150 words, prose not keywords.
- [ ] The prompt names the background `#08090B` and exactly one accent scheme, with colours given as hex and words.
- [ ] The prompt says "No text, no letters, no numbers" and excludes charts, axes, logos, people and the clichés in §2.
- [ ] The prompt ends with the 16:9 landscape instruction.
- [ ] The metaphor comes from this post's mechanism (§5), not from the title's keywords, and does not repeat another post's picture.
- [ ] Nothing in the prompt asks for a chart, a curve, a number, a ticker, an instrument or a result.
- [ ] A simpler fallback prompt is supplied.
- [ ] The Notes block tells the author to generate the file before pushing.
