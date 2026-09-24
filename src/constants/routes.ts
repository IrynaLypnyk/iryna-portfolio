export const routes = {
  home: '/',

  project: (slug: string) => `/projects/${slug}`,

  admin: {
    root: '/admin',
    login: '/admin/login',

    projects: '/admin/projects',
    projectNew: '/admin/projects/new',
    project: (id: string) => `/admin/projects/${id}`,

    media: '/admin/media',
  },
} as const;

export const anchors = {
  top: 'top',
  projects: 'projects',
  about: 'about',
  contact: 'contact',
} as const;

export const apiRoutes = {
  contact: '/api/contact',

  admin: {
    projects: '/api/admin/projects',
    project: (id: string) => `/api/admin/projects/${id}`,
    projectPhotoUpload: (id: string) => `/api/admin/projects/${id}/photos/upload`,
    projectPhotoUploadAuth: (id: string) => `/api/admin/projects/${id}/photos/upload-auth`,

    photos: {
      item: (id: string) => `/api/admin/photos/${id}`,
      reorder: '/api/admin/photos/reorder',
    },

    auth: {
      login: '/api/admin/auth/login',
      logout: '/api/admin/auth/logout',
      check: '/api/admin/auth/check',
      google: '/api/admin/auth/google',
      googleCallback: '/api/admin/auth/google/callback',
    },
  },
} as const;
