let _id = 0;
const uniqueId = () => String(++_id);

const SidebarContentAO = [
	{
		id: 1,
		name: 'MAIN MENU',
		items: [
			{
				heading: 'DASHBOARD',
				children: [
					{ name: 'Dashboard', icon: 'solar:widget-outline', id: uniqueId(), url: '/dashboard' },
				],
			},
		],
	},
	{
		id: 2,
		name: 'PCSM-SOPI',
		items: [
			{
				heading: 'ASESMEN KREDIT',
				children: [
					{ name: 'Daftar Asesmen', icon: 'solar:documents-outline', id: uniqueId(), url: '/assessments' },
				],
			},
			{
				heading: 'NASABAH',
				children: [
					{ name: 'Daftar Nasabah', icon: 'solar:users-group-two-rounded-outline', id: uniqueId(), url: '/borrowers' },
				],
			},
		],
	},
];

export default SidebarContentAO;
