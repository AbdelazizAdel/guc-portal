// for(let i=1;i<9;i++){
//     let inst = [];
//     let tas = [];
//     for(let j=1;j<5;j++){
//         inst.push('ac-'+j);
//     }
//     for(let j=7;j<10;j++){
//         tas.push('ac-'+j);
//     }
//     const courseA = new CourseModel({
//         id: 'CSEN 70'+i,
//         name: 'analysis',
//         instructors: inst,
//         TAs: tas
//     });
    
//     courseA.save().then((doc)=>{
//         console.log(doc);
//     }).catch((err)=>{
//         console.log(err);
//     });    
// }
// for(let i=1;i<10;i++){
//     const memberA = new StaffMemberModel({
//         id: 'ac-'+i,
//         email: 'ac-'+i+'@guc.edu.eg',
//         name: 'ac-'+i
//     });

//     memberA.save().then((doc)=>{
//         console.log(doc);
//     }).catch((err)=>{
//         console.log(err);
//     });    
// }
