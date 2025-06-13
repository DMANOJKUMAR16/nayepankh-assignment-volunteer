/**
 * Seed script — populates MongoDB with demo data
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose  = require('mongoose');
const User      = require('./models/User');
const Volunteer = require('./models/Volunteer');
const Event     = require('./models/Event');

const VOLUNTEERS = [
  { fname:'Priya',  lname:'Sharma',  email:'priya@demo.com',  phone:'+91 98765 00001', gender:'Female', dob:'1995-03-12', address:'Banjara Hills, Hyderabad', skills:['Teaching','Counseling'], availability:['Monday','Wednesday','Friday'], hoursPerWeek:'5–10 hours', preferredRole:'Trainer', experience:'3–5 years', motivation:'Passionate about education', status:'Active' },
  { fname:'Arjun',  lname:'Reddy',   email:'arjun@demo.com',  phone:'+91 98765 00002', gender:'Male',   dob:'1992-07-22', address:'Kondapur, Hyderabad',     skills:['Medical','Driving'],    availability:['Tuesday','Thursday','Saturday'], hoursPerWeek:'10–20 hours', preferredRole:'Frontline worker', experience:'1–3 years', motivation:'Want to give back', status:'Active' },
  { fname:'Meera',  lname:'Iyer',    email:'meera@demo.com',  phone:'+91 98765 00003', gender:'Female', dob:'1998-11-30', address:'Madhapur, Hyderabad',     skills:['Photography','Fundraising'], availability:['Saturday','Sunday'], hoursPerWeek:'1–5 hours', preferredRole:'Event helper', experience:'No prior experience', motivation:'Love community work', status:'Pending' },
  { fname:'Vikram', lname:'Nair',    email:'vikram@demo.com', phone:'+91 98765 00004', gender:'Male',   dob:'1989-05-14', address:'Gachibowli, Hyderabad',   skills:['Technology','Legal'],   availability:['Monday','Tuesday','Wednesday','Thursday','Friday'], hoursPerWeek:'5–10 hours', preferredRole:'Remote support', experience:'5+ years', motivation:'Tech for good', status:'Active' },
  { fname:'Ananya', lname:'Patel',   email:'ananya@demo.com', phone:'+91 98765 00005', gender:'Female', dob:'2000-02-18', address:'Jubilee Hills, Hyderabad', skills:['Cooking','Teaching'],  availability:['Wednesday','Saturday'], hoursPerWeek:'1–5 hours', preferredRole:'Coordinator', experience:'Less than 1 year', motivation:'Community bonds', status:'Inactive' },
  { fname:'Rohan',  lname:'Gupta',   email:'rohan@demo.com',  phone:'+91 98765 00006', gender:'Male',   dob:'1991-09-25', address:'Dilsukhnagar, Hyderabad', skills:['Construction','Driving'], availability:['Saturday','Sunday'], hoursPerWeek:'20+ hours', preferredRole:'Frontline worker', experience:'3–5 years', motivation:'Physical help needed', status:'Pending' },
];

const EVENTS = [
  { name:'Food Bank Saturday',    date:'2025-01-25', location:'L.V. Prasad Eye Institute', needed:20, registered:14, category:'Food & hunger',  description:'Sorting and distributing food packages', status:'Open'   },
  { name:'Tree Planting Drive',   date:'2025-02-08', location:'KBR Park, Hyderabad',       needed:30, registered:22, category:'Environment',    description:'Plant 500 trees across KBR National Park', status:'Open' },
  { name:'After-school Tutoring', date:'2025-01-28', location:'GHMC School, Begumpet',     needed:10, registered:10, category:'Education',      description:'Maths and science tutoring for classes 6–10', status:'Full' },
  { name:'Blood Donation Camp',   date:'2025-02-14', location:'Apollo Hospital',            needed:15, registered:7,  category:'Healthcare',     description:'Voluntary blood donation drive', status:'Open'           },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅  Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Volunteer.deleteMany(), Event.deleteMany()]);
    console.log('🗑️   Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@volunteerhub.org',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤  Admin created → admin@volunteerhub.org / admin123');

    // Create volunteers
    const vols = await Volunteer.insertMany(
      VOLUNTEERS.map(v => ({ ...v, createdBy: admin._id }))
    );
    console.log(`🙋  ${vols.length} volunteers seeded`);

    // Create events
    const evts = await Event.insertMany(
      EVENTS.map(e => ({ ...e, createdBy: admin._id }))
    );
    console.log(`📅  ${evts.length} events seeded`);

    console.log('\n🎉  Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
