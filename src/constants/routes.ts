export const routes = {
  home: '/',

  project: (slug: string) => `/projects/${slug}`,

  admin: {
    root: '/admin',
    login: '/admin/login',

    projects: '/admin/projects',
    projectNew: '/admin/projects/new',
    project: (id: string) => `/admin/projects/${id}`,

    blog: '/admin/blog',
    blogNew: '/admin/blog/new',
    blogPost: (id: string) => `/admin/blog/${id}`,

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
    auth: {
      login: '/api/admin/auth/login',
      logout: '/api/admin/auth/logout',
      check: '/api/admin/auth/check',
      google: '/api/admin/auth/google',
      googleCallback: '/api/admin/auth/google/callback',
    },
  },
} as const;
