# Asset manifest

All photography on the site is real, model-specific, and taken from **Wikimedia Commons** under the licence listed. Nothing was AI-generated, and no bike is pictured with a photo of a different model.

- Source of truth: `data/media.js` (file name, Commons page, licence, thumbnail URLs, local path).
- Authors are credited at runtime: the **Photography credits & licences** panel in the footer fetches each file's `Artist` field from the Commons API and links every file page.
- By default images load from `upload.wikimedia.org` (Commons permits hotlinking). To serve them from this project instead, run `node tools/fetch-assets.mjs` — it downloads everything into `assets/bikes/` and rewrites `data/media.js` and `index.html` to the local copies.
- CC BY-SA images: if you modify them (crop, recolour, cut out), the modified file must be shared under CC BY-SA too. The site only displays them; CSS blending and cropping are presentation, not new files.

## Photographed models (32 of 36)

| ID | Dataset model | Commons file | Licence | Caveat shown on site |
|---|---|---|---|---|
| 1 | Hero Splendor Plus Xtec | [Hero Splendor XTEC 2022.png](https://commons.wikimedia.org/wiki/File:Hero_Splendor_XTEC_2022.png) | CC BY-SA 4.0 | — |
| 3 | Honda Shine 125 | [Honda Shine.JPG](https://commons.wikimedia.org/wiki/File:Honda_Shine.JPG) | CC0 | Earlier-generation CB Shine shown |
| 4 | TVS Raider 125 | [TVS Raider 125.jpg](https://commons.wikimedia.org/wiki/File:TVS_Raider_125.jpg) | CC BY-SA 4.0 | — |
| 7 | Bajaj Pulsar 150 | [Bajaj Pulsar 150 motorcycle with a cat sitting on the seat in 2025.01.jpg](https://commons.wikimedia.org/wiki/File:Bajaj_Pulsar_150_motorcycle_with_a_cat_sitting_on_the_seat_in_2025.01.jpg) | CC0 | — |
| 8 | Honda CB Unicorn 160 | [Honda Unicorn (Space Grey).jpg](https://commons.wikimedia.org/wiki/File:Honda_Unicorn_%28Space_Grey%29.jpg) | CC BY-SA 4.0 | — |
| 9 | TVS Apache RTR 160 4V | [Apache RTR 160 4V.jpg](https://commons.wikimedia.org/wiki/File:Apache_RTR_160_4V.jpg) | CC BY-SA 4.0 | — |
| 10 | Yamaha MT-15 V2 | [Yamaha MT 15 Green version.jpg](https://commons.wikimedia.org/wiki/File:Yamaha_MT_15_Green_version.jpg) | CC BY-SA 4.0 | — |
| 11 | Bajaj Pulsar NS200 | [Bj Pulsar NS 200.jpg](https://commons.wikimedia.org/wiki/File:Bj_Pulsar_NS_200.jpg) | CC BY-SA 4.0 | — |
| 12 | KTM Duke 200 | [2020 Duke 200.jpg](https://commons.wikimedia.org/wiki/File:2020_Duke_200.jpg) | CC BY-SA 4.0 | 2020 model year shown |
| 13 | KTM Duke 390 | [Moscow, KTM Duke 390 motorcycle September 2024 05.jpg](https://commons.wikimedia.org/wiki/File:Moscow%2C_KTM_Duke_390_motorcycle_September_2024_05.jpg) | CC0 | Generation in photo not verified against listed specs |
| 14 | Triumph Speed 400 | [Triumph Speed 400.jpg](https://commons.wikimedia.org/wiki/File:Triumph_Speed_400.jpg) | CC BY 4.0 | — |
| 15 | BMW G310R | [BMW G 310 R.jpg](https://commons.wikimedia.org/wiki/File:BMW_G_310_R.jpg) | CC BY-SA 4.0 | — |
| 16 | Yamaha R15 V4 | [Yamaha R15 v4 bike.jpg](https://commons.wikimedia.org/wiki/File:Yamaha_R15_v4_bike.jpg) | CC BY-SA 4.0 | — |
| 17 | KTM RC 200 | [KTM RC 200.jpg](https://commons.wikimedia.org/wiki/File:KTM_RC_200.jpg) | CC BY 4.0 | — |
| 18 | KTM RC 390 | [2015 KTM RC390 right.JPG](https://commons.wikimedia.org/wiki/File:2015_KTM_RC390_right.JPG) | CC BY-SA 4.0 | First-generation (2015) RC 390 shown |
| 19 | Kawasaki Ninja 400 | [Kawasaki Ninja 400 KRT Edition (facelift model) right side.jpg](https://commons.wikimedia.org/wiki/File:Kawasaki_Ninja_400_KRT_Edition_%28facelift_model%29_right_side.jpg) | CC BY-SA 4.0 | KRT Edition shown |
| 20 | Hero Xpulse 200 4V | [Hero Xpulse 200 4V Pro.jpg](https://commons.wikimedia.org/wiki/File:Hero_Xpulse_200_4V_Pro.jpg) | CC BY-SA 4.0 | Pro variant shown |
| 21 | Royal Enfield Himalayan 450 | [Royal Enfield Himalayan 450 Mana Black.jpg](https://commons.wikimedia.org/wiki/File:Royal_Enfield_Himalayan_450_Mana_Black.jpg) | CC BY-SA 4.0 | — |
| 22 | KTM 390 Adventure | [Ktm-390-adventure-2024.png](https://commons.wikimedia.org/wiki/File:Ktm-390-adventure-2024.png) | CC BY-SA 4.0 | — |
| 23 | Honda NX500 | [2023 Honda NX500.jpg](https://commons.wikimedia.org/wiki/File:2023_Honda_NX500.jpg) | CC BY-SA 4.0 | — |
| 24 | BMW G310 GS | [BMW G310 GS 2023-08.jpg](https://commons.wikimedia.org/wiki/File:BMW_G310_GS_2023-08.jpg) | CC BY-SA 4.0 | — |
| 25 | Bajaj Pulsar NS400Z | [Bajaj-NS400Z.jpg](https://commons.wikimedia.org/wiki/File:Bajaj-NS400Z.jpg) | CC BY-SA 4.0 | — |
| 26 | Royal Enfield Hunter 350 | [Hunter 350 side view India Model.png](https://commons.wikimedia.org/wiki/File:Hunter_350_side_view_India_Model.png) | CC BY-SA 4.0 | — |
| 27 | Royal Enfield Classic 350 | [Royal Enfield Classic 350 (2017 Model Year).jpg](https://commons.wikimedia.org/wiki/File:Royal_Enfield_Classic_350_%282017_Model_Year%29.jpg) | CC BY-SA 4.0 | Pre-2021 Classic 350 shown |
| 28 | Royal Enfield Bullet 350 | [Enfield Bullet 350, Kathgodam, India.jpg](https://commons.wikimedia.org/wiki/File:Enfield_Bullet_350%2C_Kathgodam%2C_India.jpg) | CC BY-SA 4.0 | Earlier-generation Bullet 350 shown |
| 29 | Royal Enfield Interceptor 650 | [Royal Enfield 650 Interceptor B-Seite noBG.jpg](https://commons.wikimedia.org/wiki/File:Royal_Enfield_650_Interceptor_B-Seite_noBG.jpg) | CC BY-SA 4.0 | — |
| 31 | Honda CB350 H'Ness | [Honda CB350 H’ness.jpg](https://commons.wikimedia.org/wiki/File:Honda_CB350_H%E2%80%99ness.jpg) | CC BY-SA 4.0 | — |
| 32 | Triumph Scrambler 400X | [Triumph-Scrambler-400X.jpg](https://commons.wikimedia.org/wiki/File:Triumph-Scrambler-400X.jpg) | CC BY-SA 4.0 | — |
| 33 | Bajaj Avenger Cruise 220 | [Bajaj Avenger 220.jpg](https://commons.wikimedia.org/wiki/File:Bajaj_Avenger_220.jpg) | CC BY-SA 4.0 | — |
| 34 | Royal Enfield Shotgun 650 | [Royal enfield 650 shotgun Twin, Cape Town.jpg](https://commons.wikimedia.org/wiki/File:Royal_enfield_650_shotgun_Twin%2C_Cape_Town.jpg) | CC BY-SA 4.0 | — |
| 35 | Kawasaki Z650RS | [Kawasaki Z650RS.jpg](https://commons.wikimedia.org/wiki/File:Kawasaki_Z650RS.jpg) | CC BY-SA 4.0 | — |
| 36 | Honda CB650R | [2023 Honda CB650R Standard.jpg](https://commons.wikimedia.org/wiki/File:2023_Honda_CB650R_Standard.jpg) | CC BY-SA 4.0 | — |

The caveat text is displayed next to the photo wherever it appears, so a visitor knows when the photo shows an earlier generation or a variant.

## Models without a licensed photo (4)

No freely licensed photograph of the exact model could be verified, so the site shows a labelled schematic plate ("No licensed photograph sourced") instead of substituting another bike.

| ID | Dataset model |
|---|---|
| 2 | Honda Shine 100 |
| 5 | Hero Xtreme 125R |
| 6 | Bajaj Pulsar 125 |
| 30 | Jawa 350 |

Manufacturer press images exist for these, but their terms do not grant reuse; add them here only with written permission or a licence.

## Teardown schematic

The exploded view (`js/teardown.js`) is an original, procedurally drawn SVG. It is generated per **segment** (commuter, naked, supersport, adventure, cruiser) and is labelled on screen as a representative layout, not a measured drawing of the specific model. No third-party 3D model or diagram is used.

## Model-specific hardware (`data/components.js`)

Six models carry extra hardware details (frame, suspension, brakes, tyres, tank, seat height), each with its source:

| ID | Model | Source |
|---|---|---|
| 29 | Royal Enfield Interceptor 650 | https://en.wikipedia.org/wiki/Royal_Enfield_Interceptor_650 |
| 21 | Royal Enfield Himalayan 450 | https://www.team-bhp.com/new-bikes/royal-enfield/himalayan-450/specifications/ |
| 13 | KTM Duke 390 | https://www.ktmindia.com/ktm-bikes/naked-bike/ktm-390-duke/specifications |
| 16 | Yamaha R15 V4 | https://www.autocarindia.com/bikes/yamaha/yzf-r15-v4/specifications |
| 27 | Royal Enfield Classic 350 | https://www.royalenfield.com/content/dam/re-platform-images/home/motorcycles/royal-enfield-classic-350-technical-specifications.pdf |
| 1 | Hero Splendor Plus Xtec | https://www.smartprix.com/bikes/hero-splendor-plus-xtec-ppd1i57vy9cq |

Note: the KTM India page lists engine figures that disagree with each other, so only its chassis/brake/tyre/tank data were used; engine numbers come from the project dataset.

## Fonts

Big Shoulders Display, Inter Tight and JetBrains Mono, all SIL Open Font License, loaded from Google Fonts.
