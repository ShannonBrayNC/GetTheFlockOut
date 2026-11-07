// Deployment-specific public settings. Each city uses a separate Site and database.
// Review every address and local petition/evidence before publishing another city.
const officials = [
    { id: 'chief', name: 'Lee Thompson', role: 'Chief of Police', email: 'gthompson@angier.org' },
    { id: 'mayor', name: 'Bob Jusnes', role: 'Mayor', email: 'bjusnes@angier.org' },
    { id: 'ward1', name: 'Debra Myatt Fields', role: 'Commissioner · Ward 1', email: 'dfields@angier.org' },
    { id: 'ward2', name: 'Jennifer Sloan', role: 'Commissioner · Ward 2', email: 'jdsloan@angier.org' },
    { id: 'ward3', name: 'Chuck Carey', role: 'Commissioner · Ward 3', email: 'ccarey@angier.org' },
    { id: 'ward4', name: 'Sheveil Harmon', role: 'Commissioner · Ward 4', email: 'sharmon@angier.org' }
];
export const campaign = {
  brand: 'No More Flock',
  city: 'Angier',
  state: 'NC',
  slug: 'angier',
  localZipCodes: ['27501'],
  hostname: 'angier.nomoreflock.org',
  governmentName: 'Town of Angier',
  senderName: 'No More Flock — Angier, NC',
  senderAddress: 'angier@nomoreflock.org',
  organizerContact: 'shannonbraync@gmail.com',
  monitoringRecipients: ['shannonbraync@gmail.com'],
  officials
};
