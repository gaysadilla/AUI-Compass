"use strict";
// import { figmaApi } from '../services/figmaApi';
// 
// async function getTeamId() {
//   console.log('Fetching your Figma teams...');
//   
//   const response = await figmaApi.getUserTeams();
//   
//   if (response.status === 200 && response.data) {
//     const teams = response.data.teams;
//     
//     if (teams.length === 0) {
//       console.log('No teams found. Make sure you have access to at least one team.');
//       return;
//     }
// 
//     console.log('\nYour teams:');
//     teams.forEach((team: any) => {
//       console.log(`\nTeam Name: ${team.name}`);
//       console.log(`Team ID: ${team.id}`);
//       console.log(`Role: ${team.role}`);
//       console.log('------------------------');
//     });
//   } else {
//     console.error('Error fetching teams:', response.error);
//   }
// }
// 
// // Run the script
// getTeamId().catch(console.error); 
