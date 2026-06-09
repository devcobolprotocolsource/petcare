# Petcare (VetCare) — Static Website

Proyek ini berisi file `petcare.html` yang merupakan halaman statis lengkap UI untuk layanan klinik hewan.

Cara deploy ke GitHub Pages (root):

1. Buat repository di GitHub dan push branch `main`.
2. Pastikan file `index.html` berada di root repository. (Sudah tersedia: `index.html` yang mengarahkan ke `petcare.html`.)
3. Di GitHub, buka _Settings_ → _Pages_. Pilih branch: `main` dan folder: `/ (root)`.
4. Simpan. Situs akan dipublikasikan dalam beberapa menit di `https://<username>.github.io/<repo>`.

Catatan:
- Jika ingin agar `petcare.html` menjadi `index.html`, ganti nama file atau salin isinya ke `index.html`.
- File `.nojekyll` sudah ditambahkan untuk mencegah processing oleh Jekyll.

Jika ingin saya ubah `petcare.html` menjadi `index.html` langsung (tanpa redirect) atau memecah CSS ke file terpisah, beri tahu saja.