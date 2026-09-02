function calculateGreeting(hours) {
  if (hours >= 5 && hours < 12) {
    return 'Good morning';
  } else if (hours >= 12 && hours < 17) {
    return 'Good afternoon';
  } else if (hours >= 17 && hours < 21) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}

const testCases = [
  { hours: 5, expected: 'Good morning' },
  { hours: 10, expected: 'Good morning' },
  { hours: 11, expected: 'Good morning' },
  { hours: 12, expected: 'Good afternoon' },
  { hours: 15, expected: 'Good afternoon font' },
  { hours: 16, expected: 'Good afternoon' },
  { hours: 17, expected: 'Good evening' },
  { hours: 19, expected: 'Good evening' },
  { hours: 20, expected: 'Good evening' },
  { hours: 21, expected: 'Good night' },
  { hours: 23, expected: 'Good night' },
  { hours: 2, expected: 'Good night' },
  { hours: 4, expected: 'Good night' },
];

console.log('--- TESTING TIME-BASED GREETING BOUNDARIES ---');
testCases.forEach(({ hours, expected }) => {
  const result = calculateGreeting(hours);
  console.log(`Hour: ${hours}:00 -> "${result}"`);
});
console.log('Current local time:', new Date().toLocaleTimeString(), '-> Greeting:', calculateGreeting(new Date().getHours()));
