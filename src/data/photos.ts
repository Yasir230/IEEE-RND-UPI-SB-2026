export interface Photo {
  id: string;
  src: string;
  caption: string;
  rotation: number;
  featured?: boolean;
}

export const heroPhotos: Photo[] = [
  /* 📸 REPLACE: swap src with your actual photo path */
  { id: 'h1', src: '/images/hero-new/hero-1.jpg', caption: 'PHOTOBOOTH', rotation: -2 },
  /* 📸 REPLACE: swap src with your actual photo path */
  { id: 'h2', src: '/images/hero-new/hero-2.jpg', caption: 'PHOTOBOOTH part 2', rotation: 1.5 },
  /* 📸 REPLACE: swap src with your actual photo path */
  { id: 'h3', src: '/images/hero-new/hero-3.jpg', caption: 'Bukber', rotation: -1 },
  /* 📸 REPLACE: swap src with your actual photo path */
  { id: 'h4', src: '/images/hero-new/hero-4.jpg', caption: 'Bukber part 2', rotation: 2.5 },
  /* 📸 REPLACE: swap src with your actual photo path */
  { id: 'h5', src: '/images/hero-new/hero-5.jpg', caption: 'Bukber part 3', rotation: -3 },
  /* 📸 REPLACE: swap src with your actual photo path */
  { id: 'h6', src: '/images/hero-new/hero-6.jpg', caption: 'LUCUUUUUU', rotation: 1.8 },
  /* 📸 REPLACE: swap src with your actual photo path */
  { id: 'h7', src: '/images/hero-new/hero-7.jpg', caption: 'RND N NYA APA MAKANN', rotation: -2.2 },
];

export const galleryPhotos: Photo[] = [
  { id: 'g1', src: '/images/photo-workshop-1.jpg', caption: '', rotation: 1.5 },
  { id: 'g2', src: '/images/photo-casual-1.jpg', caption: '', rotation: -2 },
  { id: 'g3', src: '/images/photo-event-1.jpg', caption: '', rotation: 0.5 },
  { id: 'g4', src: '/images/photo-coding-1.jpg', caption: '', rotation: -1.5 },
  { id: 'g5', src: '/images/photo-meeting-1.jpg', caption: '', rotation: 2 },
  { id: 'g6', src: '/images/photo-graduation-1.jpg', caption: '', rotation: -0.5 },
  { id: 'g7', src: '/images/photo-present-1.jpg', caption: '', rotation: 1 },
  { id: 'g8', src: '/images/photo-bonding-1.jpg', caption: '', rotation: -2.5 },
  { id: 'g9', src: '/images/photo-lab-1.jpg', caption: '', rotation: 0.5 },
  { id: 'g10', src: '/images/photo-candid-1.jpg', caption: '', rotation: -1 },
  { id: 'g11', src: '/images/photo-team-1.jpg', caption: '', rotation: 2.5 },
  { id: 'g12', src: '/images/photo-casual-1.jpg', caption: '', rotation: -1.5 },
];

export const featuredPhoto: Photo = {
  id: 'f1',
  src: '/images/photo-team-1.jpg',
  caption: '',
  rotation: -1.5,
  featured: true,
};
