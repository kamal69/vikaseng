// Pre-seeded initial data extracted from Accounts SOP Workbook, EMP EXP 26-27, and WhatsApp Day Book (18-10-2026)
// Strictly in English

const SEED_DATA = {
  sites: [
    { id: 1, name: '1378 Saharanpur', location: 'Saharanpur RRO, UP', code: '1378', defaultSupervisor: 'Jahid', status: 'Running' },
    { id: 2, name: '1391 Meerut', location: 'Meerut City, UP', code: '1391', defaultSupervisor: 'Jahid', status: 'Running' },
    { id: 3, name: '1422 Deoband', location: 'Deoband Saharanpur, UP', code: '1422', defaultSupervisor: 'Devendra', status: 'Running' },
    { id: 4, name: 'Modern Service Modinagar', location: 'Modinagar Highway, UP', code: 'MOD-01', defaultSupervisor: 'Imran', status: 'Running' },
    { id: 5, name: 'Raghuveer Fuels Kaithal', location: 'Kaithal, Haryana', code: 'KTL-01', defaultSupervisor: 'Vipin Chouhan', status: 'Running' },
    { id: 6, name: 'Noida Sector 71 HPCL', location: 'Sector 71, Noida, UP', code: 'NOI-71', defaultSupervisor: 'Vipin Chouhan', status: 'Running' },
    { id: 7, name: 'NRO Hapur', location: 'Hapur Bypass Road, UP', code: 'HPR-01', defaultSupervisor: 'Imran', status: 'On Hold' },
    { id: 8, name: '849 Saharanpur', location: 'Saharanpur Outer, UP', code: '849', defaultSupervisor: 'Devendra', status: 'On Hold' },
    { id: 9, name: 'Quality Fuels', location: 'Kaithal Road, Haryana', code: 'QLT-01', defaultSupervisor: 'Jahid', status: 'On Hold' },
    { id: 10, name: 'HP Auto S-62 Noida', location: 'Sector 62, Noida, UP', code: 'NOI-62', defaultSupervisor: 'Vipin Chouhan', status: 'On Hold' },
    { id: 11, name: 'Noida Zonal Office', location: 'Zonal Office, Noida, UP', code: 'NZ-OFF', defaultSupervisor: 'Vipin Chouhan', status: 'On Hold' },
    { id: 12, name: 'HP P-3 Power Block', location: 'Greater Noida, UP', code: 'HP-P3', defaultSupervisor: 'Vipin Chouhan', status: 'On Hold' },
    { id: 13, name: 'HP Auto S-1 Noida Zonal', location: 'Sector 1, Noida, UP', code: 'NOI-01', defaultSupervisor: 'Vipin Chouhan', status: 'Closed' },
    { id: 14, name: 'HPS-01 Adhiraj Pump', location: 'Dadri Road, UP', code: 'HPS-01', defaultSupervisor: 'Vipin Chouhan', status: 'Closed' },
    { id: 15, name: 'Mohinder Lalru', location: 'Lalru, Punjab', code: 'LALRU-01', defaultSupervisor: 'Divyansh', status: 'Running' },
    { id: 16, name: 'Tepla Site', location: 'Tepla, Haryana', code: 'TEPLA-01', defaultSupervisor: 'Sonu', status: 'Running' },
    { id: 17, name: 'Rock Rose Chandigarh', location: 'Sector 20, Chandigarh', code: 'CHD-20', defaultSupervisor: 'Divyansh', status: 'Running' },
    { id: 18, name: 'Birumal Jairam Amloh', location: 'Amloh, Punjab', code: 'AMLOH-01', defaultSupervisor: 'Divyansh', status: 'Running' }
  ],

  supervisors: [
    { id: 1, name: 'Jahid', phone: '+91 98711 02001', role: 'Site Supervisor', primarySite: '1378 Saharanpur', status: 'Present' },
    { id: 2, name: 'Devendra', phone: '+91 98711 02002', role: 'Site Supervisor', primarySite: '1422 Deoband', status: 'Present' },
    { id: 3, name: 'Imran', phone: '+91 98711 02003', role: 'Site Supervisor', primarySite: 'Modern Service Modinagar', status: 'Present' },
    { id: 4, name: 'Vipin Chouhan', phone: '+91 98711 02004', role: 'Senior Field Supervisor', primarySite: 'Noida Sector 71 HPCL', status: 'On Leave' },
    { id: 5, name: 'Sanjay', phone: '+91 98711 02005', role: 'Assistant Supervisor / Helper', primarySite: 'Noida Sector 71 HPCL', status: 'Present' },
    { id: 6, name: 'Divyansh', phone: '+91 98711 02006', role: 'Project Engineer & Imprest Holder', primarySite: 'Mohinder Lalru', status: 'Present' },
    { id: 7, name: 'Sonu', phone: '+91 98711 02007', role: 'Site Supervisor', primarySite: 'Tepla Site', status: 'Present' },
    { id: 8, name: 'Bipin', phone: '+91 98711 02008', role: 'Head of Operations & Imprest Admin', primarySite: 'Head Office / Field', status: 'Present' },
    { id: 9, name: 'Rakesh', phone: '+91 98711 02009', role: 'Site Supervisor', primarySite: 'Field Projects', status: 'Present' },
    { id: 10, name: 'Anjan', phone: '+91 98711 02010', role: 'Junior Supervisor', primarySite: 'Devaryian Office', status: 'Absent' }
  ],

  // Daily Field Reports (Matching Day Book images of 2026-10-18)
  reports: [
    {
      id: 1,
      date: '2026-10-18',
      siteName: '1378 Saharanpur',
      siteStatus: 'Running',
      supervisorName: 'Jahid',
      supervisorAttendance: 'Present',
      workDescription: 'De-brick work, foundation cleaning and walkway soil filling',
      manpower: [
        { category: 'Mason', type: 'Chowk', count: 1, rate: 900, total: 900 },
        { category: 'Labour', type: 'Chowk', count: 1, rate: 700, total: 700 },
        { category: 'Labour', type: 'Permanent', count: 2, rate: 500, total: 1000 },
        { category: 'Other Contractor', type: 'Contractor', count: 2, rate: 950, details: 'Tiles Mason on Contract', total: 1900 },
        { category: 'Other Contractor', type: 'Contractor', count: 2, rate: 1000, details: 'Structural Welder on Contract', total: 2000 }
      ],
      totalManpowerCost: 6500,
      totalManpowerCount: 8,
      remarks: 'De-brick work finished. Need 20 bags cement tomorrow.'
    },
    {
      id: 2,
      date: '2026-10-18',
      siteName: '1391 Meerut',
      siteStatus: 'Running',
      supervisorName: 'Jahid',
      supervisorAttendance: 'Present',
      workDescription: 'Panel Room trench brick work, conduit laying, and walkway soil filling',
      manpower: [
        { category: 'Mason', type: 'Chowk', count: 1, rate: 900, total: 900 },
        { category: 'Labour', type: 'Chowk', count: 1, rate: 800, total: 800 },
        { category: 'Labour', type: 'Permanent', count: 2, rate: 650, total: 1300 }
      ],
      totalManpowerCost: 3000,
      totalManpowerCount: 4,
      remarks: 'Trench brick work in progress. Electrician inspection scheduled.'
    },
    {
      id: 3,
      date: '2026-10-18',
      siteName: '1422 Deoband',
      siteStatus: 'Running',
      supervisorName: 'Devendra',
      supervisorAttendance: 'Present',
      workDescription: 'Soak pit excavation, brick lining work, and drainage connection',
      manpower: [
        { category: 'Mason', type: 'Chowk', count: 1, rate: 800, total: 800 },
        { category: 'Labour', type: 'Permanent', count: 2, rate: 550, total: 1100 }
      ],
      totalManpowerCost: 1900,
      totalManpowerCount: 3,
      remarks: 'Soak pit brick work halfway done.'
    },
    {
      id: 4,
      date: '2026-10-18',
      siteName: 'Modern Service Modinagar',
      siteStatus: 'Running',
      supervisorName: 'Imran',
      supervisorAttendance: 'Present',
      workDescription: 'Curb stone casting, curb wall trench excavation, and column footing casting',
      manpower: [
        { category: 'Mason', type: 'Chowk', count: 2, rate: 850, total: 1700 },
        { category: 'Labour', type: 'Permanent', count: 2, rate: 550, total: 1100 },
        { category: 'Labour', type: 'Chowk', count: 1, rate: 650, total: 650 }
      ],
      totalManpowerCost: 3450,
      totalManpowerCount: 5,
      remarks: 'Curb stone shuttering set up for casting batch.'
    },
    {
      id: 5,
      date: '2026-10-18',
      siteName: 'Raghuveer Fuels Kaithal',
      siteStatus: 'Running',
      supervisorName: 'Vipin Chouhan',
      supervisorAttendance: 'On Leave (Report by Field Lead)',
      workDescription: 'Dispensing island brick work, PVC pipe chamber brick work, and wall plaster',
      manpower: [
        { category: 'Mason', type: 'Chowk', count: 1, rate: 1100, total: 1100 },
        { category: 'Labour', type: 'Chowk', count: 3, rate: 800, total: 2400 }
      ],
      totalManpowerCost: 3500,
      totalManpowerCount: 4,
      remarks: 'Island plaster completed. Pipe chamber work underway.'
    },
    {
      id: 6,
      date: '2026-10-18',
      siteName: 'Noida Sector 71 HPCL',
      siteStatus: 'Running',
      supervisorName: 'Sanjay',
      supervisorAttendance: 'Present',
      workDescription: 'Curb wall patti patching, surface cleaning, and primer paints',
      manpower: [
        { category: 'Painter', type: 'Contractor', count: 2, rate: 800, total: 1600 }
      ],
      totalManpowerCost: 1600,
      totalManpowerCount: 2,
      remarks: 'First coat finished. Final coat will be applied tomorrow.'
    },
    {
      id: 7,
      date: '2026-10-18',
      siteName: 'Mohinder Lalru',
      siteStatus: 'Running',
      supervisorName: 'Divyansh',
      supervisorAttendance: 'Present',
      workDescription: 'Paver block base leveling, compaction, and edge curbing',
      manpower: [
        { category: 'Labour', type: 'Contractor', count: 4, rate: 700, total: 2800 },
        { category: 'Other Contractor', type: 'Contractor', count: 1, rate: 5000, details: 'Paver Contractor Lumpsum Advance', total: 5000 }
      ],
      totalManpowerCost: 7800,
      totalManpowerCount: 5,
      remarks: 'Paver blocks delivered on site.'
    },
    {
      id: 8,
      date: '2026-10-18',
      siteName: 'Tepla Site',
      siteStatus: 'Running',
      supervisorName: 'Sonu',
      supervisorAttendance: 'Present',
      workDescription: 'Boundary wall foundation digging and brickwork',
      manpower: [
        { category: 'Labour', type: 'Chowk', count: 4, rate: 750, total: 3000 }
      ],
      totalManpowerCost: 3000,
      totalManpowerCount: 4,
      remarks: 'Foundation digging 80% done.'
    }
  ],

  // Machinery Records (Hourly System & Daily System)
  machinery: [
    {
      id: 1,
      date: '2026-10-18',
      machineName: 'JCB 3DX Excavator',
      regNo: 'UP14-JCB-902',
      siteName: '1378 Saharanpur',
      supervisorName: 'Jahid',
      ownership: 'On Rent',
      billingType: 'Hourly System',
      hoursUsed: 5.5,
      daysUsed: 0,
      ratePerHour: 950,
      ratePerDay: 0,
      machineCost: 5225,
      fuelCost: 2200,
      totalCost: 7425,
      paidBy: 'Jahid',
      status: 'Working',
      remarks: 'Used for trench de-bricking and heavy soil levelling (5.5 hrs)'
    },
    {
      id: 2,
      date: '2026-10-18',
      machineName: 'Concrete Mixer 10/7 (Diesel)',
      regNo: 'MX-01',
      siteName: 'Modern Service Modinagar',
      supervisorName: 'Imran',
      ownership: 'Own',
      billingType: 'Daily Rate',
      hoursUsed: 0,
      daysUsed: 1,
      ratePerHour: 0,
      ratePerDay: 0, // Own machine rent = 0 as per SOP
      machineCost: 0,
      fuelCost: 1650,
      totalCost: 1650,
      paidBy: 'Imran',
      status: 'Working',
      remarks: 'Company owned machine. Used for curb stone and column batch casting'
    },
    {
      id: 3,
      date: '2026-10-18',
      machineName: 'Diesel Generator 15 KVA (Kirloskar)',
      regNo: 'GEN-02',
      siteName: '1422 Deoband',
      supervisorName: 'Devendra',
      ownership: 'On Rent',
      billingType: 'Daily Rate',
      hoursUsed: 0,
      daysUsed: 1,
      ratePerHour: 0,
      ratePerDay: 1200,
      machineCost: 1200,
      fuelCost: 1800,
      totalCost: 3000,
      paidBy: 'Devendra',
      status: 'Working',
      remarks: 'Daily rent generator for water pump, soak pit dewatering & lighting'
    },
    {
      id: 4,
      date: '2026-10-18',
      machineName: 'Plate Vibrator & Compactor',
      regNo: 'VIB-04',
      siteName: 'Mohinder Lalru',
      supervisorName: 'Divyansh',
      ownership: 'On Rent',
      billingType: 'Daily Rate',
      hoursUsed: 0,
      daysUsed: 1,
      ratePerHour: 0,
      ratePerDay: 800,
      machineCost: 800,
      fuelCost: 500,
      totalCost: 1300,
      paidBy: 'Divyansh',
      status: 'Working',
      remarks: 'Soil & sand base compaction for paver laying'
    },
    {
      id: 5,
      date: '2026-10-18',
      machineName: 'Hydraulic Breaker & Compressor',
      regNo: 'BRK-08',
      siteName: '1391 Meerut',
      supervisorName: 'Jahid',
      ownership: 'On Rent',
      billingType: 'Hourly System',
      hoursUsed: 3,
      daysUsed: 0,
      ratePerHour: 1100,
      ratePerDay: 0,
      machineCost: 3300,
      fuelCost: 1200,
      totalCost: 4500,
      paidBy: 'Jahid',
      status: 'Working',
      remarks: 'Old concrete breaking for electrical cable trench (3.0 hrs)'
    }
  ],

  // Tools & Equipment Inventory (Valuation, Assignment & Tracking)
  tools: [
    {
      id: 1,
      toolName: 'Bosch 14-Inch Metal/Masonry Cut-Off Saw',
      toolTag: 'TL-CUT-01',
      category: 'Power Tools',
      costPrice: 14500,
      siteName: '1378 Saharanpur',
      assignedTo: 'Jahid',
      issueDate: '2026-10-10',
      returnDate: '',
      status: 'Active on Site',
      condition: 'Good',
      remarks: 'Fitted with new diamond cutting blade'
    },
    {
      id: 2,
      toolName: 'Bosch Rotary Hammer Drill 26mm',
      toolTag: 'TL-DRL-02',
      category: 'Power Tools',
      costPrice: 8200,
      siteName: '1391 Meerut',
      assignedTo: 'Jahid',
      issueDate: '2026-10-12',
      returnDate: '',
      status: 'Active on Site',
      condition: 'Good',
      remarks: 'Complete drill bit set included'
    },
    {
      id: 3,
      toolName: 'Concrete Needle Vibrator 60mm & Motor',
      toolTag: 'TL-VND-03',
      category: 'Vibrators & Needles',
      costPrice: 7500,
      siteName: 'Modern Service Modinagar',
      assignedTo: 'Imran',
      issueDate: '2026-10-14',
      returnDate: '',
      status: 'Active on Site',
      condition: 'Good',
      remarks: 'Used for curb stone and footing concrete vibration'
    },
    {
      id: 4,
      toolName: 'Heavy Duty 4-Inch Angle Grinder',
      toolTag: 'TL-GRN-04',
      category: 'Power Tools',
      costPrice: 3800,
      siteName: '1422 Deoband',
      assignedTo: 'Devendra',
      issueDate: '2026-10-15',
      returnDate: '',
      status: 'Active on Site',
      condition: 'Good',
      remarks: 'Used for pipe cutting and brick trimming'
    },
    {
      id: 5,
      toolName: 'Auto Level Instrument & Tripod Staff',
      toolTag: 'TL-SUR-05',
      category: 'Survey & Measuring',
      costPrice: 18500,
      siteName: 'Mohinder Lalru',
      assignedTo: 'Divyansh',
      issueDate: '2026-10-05',
      returnDate: '',
      status: 'Active on Site',
      condition: 'Calibrated',
      remarks: 'Site slope and drainage level marking'
    },
    {
      id: 6,
      toolName: 'Painter Spray Gun & Pressure Hose',
      toolTag: 'TL-PNT-06',
      category: 'Finishing Equipment',
      costPrice: 4200,
      siteName: 'Noida Sector 71 HPCL',
      assignedTo: 'Sanjay',
      issueDate: '2026-10-16',
      returnDate: '',
      status: 'Active on Site',
      condition: 'Good',
      remarks: 'High pressure spray for curb wall paint'
    }
  ],

  // Cash Inflow: Advance Given by Company to Supervisors
  cashInflow: [
    { id: 1, date: '2026-10-10', supervisorName: 'Jahid', siteName: '1378 Saharanpur', amount: 50000, paymentMode: 'Bank Transfer / NEFT', voucherNo: 'NEFT-8801', remarks: 'Site imprest advance for labour wages & machinery' },
    { id: 2, date: '2026-10-12', supervisorName: 'Devendra', siteName: '1422 Deoband', amount: 35000, paymentMode: 'Cash (Head Office)', voucherNo: 'VCH-1092', remarks: 'Cash advance for soak pit work' },
    { id: 3, date: '2026-10-14', supervisorName: 'Imran', siteName: 'Modern Service Modinagar', amount: 40000, paymentMode: 'UPI / GPay', voucherNo: 'UPI-77102', remarks: 'Emergency imprest transfer' },
    { id: 4, date: '2026-10-15', supervisorName: 'Divyansh', siteName: 'Mohinder Lalru', amount: 75000, paymentMode: 'Bank Transfer / NEFT', voucherNo: 'NEFT-8845', remarks: 'Paver blocks contractor & labour fund' },
    { id: 5, date: '2026-10-16', supervisorName: 'Sonu', siteName: 'Tepla Site', amount: 20000, paymentMode: 'Cash', voucherNo: 'VCH-1104', remarks: 'Weekly labour advance' }
  ],

  // Site Expenses: Distinctly split into "company" (Company Fund) vs "self" (Supervisor Out-of-Pocket)
  expenses: [
    // Jahid's Expenses
    { id: 1, date: '2026-10-18', supervisorName: 'Jahid', siteName: '1378 Saharanpur', category: 'Labour Wages', amount: 6500, fundingSource: 'company', paidTo: 'Masons & Helpers (8 Nos)', voucherNo: 'WAG-01', remarks: 'Daily wage payment as per Morning Report' },
    { id: 2, date: '2026-10-18', supervisorName: 'Jahid', siteName: '1378 Saharanpur', category: 'Machinery on Rent', amount: 5225, fundingSource: 'company', paidTo: 'JCB Operator (5.5 hrs)', voucherNo: 'JCB-44', remarks: 'Hourly machine rental @ 950/hr' },
    { id: 3, date: '2026-10-18', supervisorName: 'Jahid', siteName: '1378 Saharanpur', category: 'Machinery Fuel', amount: 2200, fundingSource: 'company', paidTo: 'Kisan Fuel Pump', voucherNo: 'PET-101', remarks: 'Diesel for JCB excavator' },
    { id: 4, date: '2026-10-18', supervisorName: 'Jahid', siteName: '1391 Meerut', category: 'Labour Wages', amount: 3000, fundingSource: 'company', paidTo: 'Mason & Labour (4 Nos)', voucherNo: 'WAG-02', remarks: 'Panel room trench work wages' },
    { id: 5, date: '2026-10-18', supervisorName: 'Jahid', siteName: '1378 Saharanpur', category: 'Tool Purchase / Repair', amount: 1850, fundingSource: 'self', paidTo: 'Local Hardware Store', voucherNo: 'CASH-99', remarks: 'Cutting blades and emergency wrench set (Paid from personal cash by Jahid)' },

    // Devendra's Expenses
    { id: 6, date: '2026-10-18', supervisorName: 'Devendra', siteName: '1422 Deoband', category: 'Labour Wages', amount: 1900, fundingSource: 'company', paidTo: 'Devendra Mistri & Beldar', voucherNo: 'WAG-03', remarks: 'Soak pit daily wages' },
    { id: 7, date: '2026-10-18', supervisorName: 'Devendra', siteName: '1422 Deoband', category: 'Machinery on Rent', amount: 1200, fundingSource: 'company', paidTo: 'Generator Vendor', voucherNo: 'GEN-12', remarks: '1 Day generator rental' },
    { id: 8, date: '2026-10-18', supervisorName: 'Devendra', siteName: '1422 Deoband', category: 'Machinery Fuel', amount: 1800, fundingSource: 'company', paidTo: 'Highway Fuel Point', voucherNo: 'PET-204', remarks: 'Generator diesel' },

    // Imran's Expenses
    { id: 9, date: '2026-10-18', supervisorName: 'Imran', siteName: 'Modern Service Modinagar', category: 'Labour Wages', amount: 3450, fundingSource: 'company', paidTo: 'Masons & Helpers (5 Nos)', voucherNo: 'WAG-04', remarks: 'Curb stone casting wages' },
    { id: 10, date: '2026-10-18', supervisorName: 'Imran', siteName: 'Modern Service Modinagar', category: 'Machinery Fuel', amount: 1650, fundingSource: 'company', paidTo: 'Modinagar Indian Oil', voucherNo: 'PET-309', remarks: 'Diesel for Concrete Mixer' },
    { id: 11, date: '2026-10-18', supervisorName: 'Imran', siteName: 'Modern Service Modinagar', category: 'Local Transport & Travel', amount: 950, fundingSource: 'self', paidTo: 'Tempo Driver', voucherNo: 'SLIP-41', remarks: 'Urgent shuttering oil & plate transport (Paid from Imran personal cash)' },

    // Divyansh's Expenses
    { id: 12, date: '2026-10-18', supervisorName: 'Divyansh', siteName: 'Mohinder Lalru', category: 'Labour Wages', amount: 7800, fundingSource: 'company', paidTo: 'Paver Contractor & Labour', voucherNo: 'WAG-05', remarks: 'Paver block installation wages' },
    { id: 13, date: '2026-10-18', supervisorName: 'Divyansh', siteName: 'Mohinder Lalru', category: 'Machinery on Rent', amount: 800, fundingSource: 'company', paidTo: 'Plate Compactor Rental', voucherNo: 'VIB-01', remarks: 'Compactor daily rent' }
  ]
};
