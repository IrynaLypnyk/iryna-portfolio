export const routes = {
  home: '/',

  project: (slug: string) => `/projects/${slug}`,
  playground: '/playground',

  admin: {
    root: '/admin',
    login: '/admin/login',

    projects: '/admin/projects',
    projectNew: '/admin/projects/new',
    project: (id: string) => `/admin/projects/${id}`,

    experiments: '/admin/experiments',
    experimentNew: '/admin/experiments/new',
    experiment: (id: string) => `/admin/experiments/${id}`,

    media: '/admin/media',
  },
} as const;

export const anchors = {
  top: 'top',
  hero: 'hero',
  projects: 'projects',
  playground: 'playground',
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

    experiments: '/api/admin/experiments',
    experiment: (id: string) => `/api/admin/experiments/${id}`,
    experimentCoverUpload: (id: string) => `/api/admin/experiments/${id}/cover/upload`,
    experimentCoverUploadAuth: (id: string) => `/api/admin/experiments/${id}/cover/upload-auth`,

    auth: {
      login: '/api/admin/auth/login',
      logout: '/api/admin/auth/logout',
      check: '/api/admin/auth/check',
      google: '/api/admin/auth/google',
      googleCallback: '/api/admin/auth/google/callback',
    },
  },
} as const;
