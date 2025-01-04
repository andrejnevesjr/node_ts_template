import Person from '@/person';

it('should sum', () => {
  const person = new Person();
  expect(person.sayHeello()).toBe('Hello');
});
