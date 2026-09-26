let _id = 0;
const uniqueId = () => String(++_id);

const SidebarContentNasabah = [
  {
    id: 1,
    name: 'MENU',
    items: [
      {
        heading: 'MENU',
        children: [
          { name: 'Dashboard', icon: 'solar:widget-outline', id: uniqueId(), url: '/dashboard' },
        ],
      },
    ],
  },
];

export default SidebarContentNasabah;
