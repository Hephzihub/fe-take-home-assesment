import { createRouter, createWebHistory } from 'vue-router';
import SchoolDashboard from '@/views/SchoolDashboard.vue';
import SchoolDetail from '@/views/SchoolDetail.vue';

import { env } from '@/config/env';
const router = createRouter({
  history: createWebHistory(env.APP_BASE_PATH),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: SchoolDashboard,
      meta: {
        title: 'School Dashboard'
      }
    },
    {
      path: '/school/:academyId',
      name: 'school-detail',
      component: SchoolDetail,
      props: true,
      meta: {
        title: 'School Details'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
});

router.beforeEach((to) => {
  document.title = `${to.meta.title} - Battery Monitoring Dashboard`;
});

export default router;
