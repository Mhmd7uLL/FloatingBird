# Floating "Hand Tracking" Bird

2D game with AI Feature, which is Hand Tracking feature that makes some movements inside game only by moving hand vertically.

# Tech Stack

1. Language: JavaScript
2. UI: React
3. Style: Standart CSS Style
4. Model: MediaPipe Hand LandMarker

# Game System

1. Pengguna akan ditugaskan untuk menggerakkan burung melewati pipa dengan cara menyalakan webcam lalu membuka telapak tangan dengan status "Open Palm"
2. Game akan dimulai dengan status Open Palm confidence minimal 55%
3. Jika berhasil melewati pipa, maka score akan bertambah 1
4. Jika menabrak pipa, maka game over dan score akan terulang ke 0 jika main kembali
5. Game pause akan terjadi jika pengguna mengesampingkan telapak tangan dari webcam, ataupun menutup webcam sampai statusnya "Closed Fist" dengan status confidence 75%

# How to Run Project

1. Clone repository ini
2. Install dependency yang dibutuhkan dengan command

```bash
cd flappyHand
npm install
```

3. Jalankan Frontend

```bash
npm run dev
```
