const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Hariesh003@localhost:5432/Driverx_db',
  });

  await client.connect();
  console.log('Connected to Driverx_db');

  const packages = [
    {
      id: '1h',
      label: '1 Hour',
      subtitle: 'Quick Rides',
      hours: 1,
      baseFare: 299,
      description: 'Quick rides and urgent local travel within city limits.',
      iconType: 'clock',
    },
    {
      id: '2h',
      label: '2 Hours',
      subtitle: 'Business Trips',
      hours: 2,
      baseFare: 499,
      description: 'Meetings, shopping, clinic visits and personal travel.',
      iconType: 'clock',
    },
    {
      id: '4h',
      label: '4 Hours',
      subtitle: 'City Tours',
      hours: 4,
      baseFare: 899,
      description: 'Multiple stops across the city and half-day errands.',
      iconType: 'clock',
    },
    {
      id: '6h',
      label: '6 Hours',
      subtitle: 'Longer Trips',
      hours: 6,
      baseFare: 1299,
      description: 'Extended business meetings or outstation local excursions.',
      iconType: 'clock',
    },
    {
      id: 'fullday',
      label: 'Full Day',
      subtitle: 'Full Day',
      hours: 12,
      baseFare: 2199,
      description: 'Complete 12-hour chauffeured travel experience.',
      iconType: 'sun',
    },
    {
      id: '1week',
      label: '1 Week',
      subtitle: 'Long Term',
      hours: 168,
      baseFare: 12999,
      description: 'Dedicated weekly chauffeur service for continuous mobility.',
      iconType: 'calendar',
    },
  ];

  for (const pkg of packages) {
    await client.query(
      `INSERT INTO duration_packages (id, label, subtitle, hours, "baseFare", description, "iconType", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         label = EXCLUDED.label,
         subtitle = EXCLUDED.subtitle,
         hours = EXCLUDED.hours,
         "baseFare" = EXCLUDED."baseFare",
         description = EXCLUDED.description,
         "iconType" = EXCLUDED."iconType",
         "updatedAt" = NOW()`,
      [pkg.id, pkg.label, pkg.subtitle, pkg.hours, pkg.baseFare, pkg.description, pkg.iconType]
    );
  }

  console.log('Seeded 6 duration packages into Driverx_db successfully.');
  await client.end();
}

main().catch((err) => {
  console.error('Error seeding DB:', err);
  process.exit(1);
});
