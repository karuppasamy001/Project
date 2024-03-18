import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-set-goals',
  templateUrl: './set-goals.component.html',
  styleUrls: ['./set-goals.component.scss'],
})
export class SetGoalsComponent implements OnInit {
  currentSem: number = 0;
  currentCGPA: number = 0;
  expectedCGPA: number = 0;
  sampleCourseDetails: any[] = [];
  courseDetails: any[] = [];
  toFind: any[] = [];
  maxCgpa!: string;
  expectedCGPAInvalid: boolean = false;
  submitButton: boolean = true;
  selectedDocument: string = '';
  studentRegistrationNumber!: string;

  constructor(private http: HttpClient, private stud: StudentService) {}

  courseUrl: string = 'http://localhost:5984/sapas/Courses';
  markUrl!: string;
  studentUrl: string = 'http://localhost:5984/sapas/StudentData';

  ngOnInit(): void {
    // Fetch current semester details
    this.currentSem = this.stud.studentData.currentSem;
    this.studentRegistrationNumber = this.stud.studentData.registrationNumber;
  }

  validateExpectedCGPA(): void {
    this.expectedCGPAInvalid = this.expectedCGPA < 5 || this.expectedCGPA > 10;
    this.submitButton = this.expectedCGPAInvalid;
  }

  fetchCourseDetails(): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http.get(this.courseUrl, { headers }).subscribe(
      (data: any) => {
        const currentSemesters = `Semester${this.currentSem}`;
        this.sampleCourseDetails = Object.entries(
          data[this.stud.studentData.batch][currentSemesters]
        );

        let courses: any[] = [];
        for (let course of this.sampleCourseDetails) {
          let newRow: any = {};
          newRow.code = course[0];
          newRow.name = course[1][0];
          newRow.credits = course[1][1];
          newRow.cat1 = '';
          newRow.cat2 = '';
          newRow.external = '';
          newRow.cat1Flag = false;
          newRow.cat2Flag = false;
          newRow.externalFlag = false;

          courses.push(newRow);
        }

        this.courseDetails = courses;
        this.fetchUploadedMarks();
      },
      (error) => {
        console.error('Error fetching course data', error);
      }
    );
  }

  fetchUploadedMarks(): void {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http.get(this.markUrl, { headers }).subscribe(
      (data: any) => {
        const currentSemesters = `Semester${this.currentSem}`;
        const marks = data[this.stud.studentData.batch][currentSemesters];

        for (let course of this.courseDetails) {
          const cat1Marks =
            marks[course.code]['cat1'][this.studentRegistrationNumber].mark;
          const cat1Assignment =
            marks[course.code]['cat1'][this.studentRegistrationNumber]
              .assignment;

          if (cat1Marks && cat1Assignment) {
            const cat1 = parseFloat(cat1Assignment) + parseFloat(cat1Marks);
            this.courseDetails[this.courseDetails.indexOf(course)].cat1 =
              Math.round(cat1);

            const cat2Marks =
              marks[course.code]['cat2'][this.studentRegistrationNumber].mark;
            const cat2Assignment =
              marks[course.code]['cat2'][this.studentRegistrationNumber]
                .assignment;

            if (cat2Assignment && cat2Marks) {
              const cat2 = parseFloat(cat2Assignment) + parseFloat(cat2Marks);
              this.courseDetails[this.courseDetails.indexOf(course)].cat2 =
                Math.round(cat2);

              this.courseDetails[this.courseDetails.indexOf(course)].internal = Math.round(cat1) + Math.round(cat2)  

              this.toFind = ['external'];
            } else {
              this.toFind = ['cat2', 'external'];
            }
          } else {
            this.toFind = ['cat1', 'cat2', 'external'];
          }
        }

        console.log(this.courseDetails);
      },
      (error) => {
        console.error('Error fetching Marks Data', error);
      }
    );
  }

  findMarks(): void {

    if (this.toFind.length === 3) this.findAllMarks();
    if (this.toFind.length === 2) this.findCat2AndFinalMarks();
    if (this.toFind.length === 1) this.findFinalMarks();
  
  }

  findTotalMarksFromGradePoints(grade: number): number {
    switch (true) {
      case grade == 10:
        return 91;
      case grade >= 9:
        return 81;
      case grade >= 8:
        return 71;
      case grade >= 7:
        return 61;
      case grade >= 6:
        return 51;
      case grade >= 5:
        return 50;
      default:
        return 50;
    }
  }

  findGradePointsFromTotalMarks(grade: number): number {
    switch (true) {
      case grade > 90:
        return 10;
      case grade > 80:
        return 9;
      case grade > 70:
        return 8;
      case grade > 60:
        return 7;
      case grade > 50:
        return 6;
      case grade == 5:
        return 5;
      default:
        return 5;
    }
  }

  findAllMarks(): void {
    const expectedGPA = this.findExpectedGPA();

    if (expectedGPA > 10) {
      this.openModal();
      this.maxCgpa = ((this.currentCGPA + 10) / 2).toFixed(2);
      return;
    }

    let total = 0;

    for (let course of this.courseDetails) {
      const totalMark = this.findTotalMarksFromGradePoints(
        Math.round(expectedGPA)
      );

      this.courseDetails[
        this.courseDetails.indexOf(course)
      ].cat1 = ` ${totalMark} - ${totalMark + 9}`;
      this.courseDetails[
        this.courseDetails.indexOf(course)
      ].cat2 = ` ${totalMark} - ${totalMark + 9}`;
      this.courseDetails[
        this.courseDetails.indexOf(course)
      ].external = ` ${totalMark} - ${totalMark + 9}`;
      this.courseDetails[this.courseDetails.indexOf(course)].cat1Flag = true;
      this.courseDetails[this.courseDetails.indexOf(course)].cat2Flag = true;
      this.courseDetails[this.courseDetails.indexOf(course)].externalFlag =
        true;

      total += course.credits * expectedGPA;
    }
  }



  findCat2AndFinalMarks(): void {

    const expectedGPA = this.findExpectedGPA();

    const calculateMaxGPA = (): number => {
      let totalGradePoints = 0;
      let totalCredits = 0;
    
      for (let course of this.courseDetails) {
        const cat1 = course.cat1;
    
        const internal = (cat1 + 95) / 200 * 40;
        const external = 95 / 100 * 60;
    
        const total = internal + external;
    
        const gradePoint = this.findGradePointsFromTotalMarks(total);
        totalGradePoints += gradePoint * course.credits;
        totalCredits += course.credits;
    
      }
    
      const maxGPA = (totalGradePoints / totalCredits);
      return maxGPA;
    };
    
    const maxGPA = calculateMaxGPA();
   
    if (expectedGPA > maxGPA || expectedGPA > 10) {
      this.openModal();
      this.maxCgpa = ((this.currentCGPA + maxGPA) / 2).toFixed(2);
      return;
    }

    const MaxMarks = this.findTotalMarksFromGradePoints(expectedGPA)


    for(let course of this.courseDetails){
      const cat1Mark = course.cat1
      let cat2Mark = 0
      let externalMark = 0

      for(let i = 50; i <= 100; i ++){
        let cat2 = i
        const internal = (cat1Mark + cat2)/200 * 40
        let external = ((MaxMarks - internal)*100)/60

        if(external <= 100){

          const total = internal + external/100*60

          if(this.findGradePointsFromTotalMarks(total) >= Math.round(expectedGPA)){
  
            if(this.differenceOf(cat2, external)){
              cat2Mark = cat2
              externalMark = external

              console.log('1 - ', internal, '2 - ', external/100*60)
              break
            }
            else {

              for(let j = 0; j < 50; j++){

              const newCat2 = cat2 + 1
              const newExternal = external - 1

              const newInternal = (cat1Mark + newCat2)/200 * 40

              const newTotal = newInternal + newExternal/100 * 60

              if(this.findGradePointsFromTotalMarks(newTotal) >= Math.round(expectedGPA) && this.differenceOf(newCat2, newExternal)){
                cat2Mark = cat2
                externalMark = external
                console.log('1 - ', newInternal, '2 - ', newExternal/100*60)

                break
              }

              cat2 += 1
              external -= 1

            }


            }
              
            
            
          
          }

        }

        
      }

      
      this.courseDetails[this.courseDetails.indexOf(course)].external = `${Math.round(externalMark)} - ${Math.round(externalMark) + 10}`
      this.courseDetails[this.courseDetails.indexOf(course)].externalFlag = true
      this.courseDetails[this.courseDetails.indexOf(course)].cat2 = `${Math.round(cat2Mark)} - ${Math.round(cat2Mark + 10)}`
      this.courseDetails[this.courseDetails.indexOf(course)].cat2Flag = true



    }



    


  }

  differenceOf(cat2: number, external: number): boolean{

    if(cat2 === external){
      return true
    }

    const difference = Math.max(external, cat2) -  Math.min(external, cat2)

    if(difference  <= 5 && difference > 0){
      return true 
    }


    return false
  }



  findFinalMarks(): void {
    const expectedGPA = this.findExpectedGPA();

    if (expectedGPA > 10) {
      this.openModal();
      this.maxCgpa = ((this.currentCGPA + 10) / 2).toFixed(2);
      return;
    }

    const MaxMarks = this.findTotalMarksFromGradePoints(expectedGPA)


    for(let course of this.courseDetails){
      const internal = Math.round(course.internal / 200 * 40)
      let external = ((MaxMarks - internal)*100)/60


      if(external > 100) {
        external = 90
      }
    
      this.courseDetails[this.courseDetails.indexOf(course)].MaxExternal = external
      this.courseDetails[this.courseDetails.indexOf(course)].external = `${Math.round(external)} - ${Math.round(external) + 10}`
      this.courseDetails[this.courseDetails.indexOf(course)].externalFlag = true
    }

    

  }

  

  findGradePoints(gpa: number): number {
    let totalCredits = 0;
    for (let course of this.courseDetails) {
      totalCredits += course.credits;
    }
    return totalCredits;
  }

  findExpectedGPA(): number {
    const expectedCGPA = this.expectedCGPA;
    let expectGPA = 0;
    const students = this.stud.studentData;

    if (this.currentSem === 1) {
      expectGPA = expectedCGPA;
    } else if (this.currentSem === 2) {
      const totalGPAs = students.sem1Gpa;
      expectGPA = expectedCGPA * 2 - totalGPAs;
    } else if (this.currentSem === 3) {
      const totalGPAs = students.sem1Gpa + students.sem2Gpa;
      expectGPA = expectedCGPA * 3 - totalGPAs;
    } else if (this.currentSem === 4) {
      const totalGPAs = students.sem1Gpa + students.sem2Gpa + students.sem3Gpa;
      expectGPA = expectedCGPA * 4 - totalGPAs;
    }

    return expectGPA;
  }

  openModal() {
    const modal = document.getElementById('myModal');
    modal!.classList.add('show');
    modal!.style.display = 'block';
    document.body.classList.add('modal-open');
  }

  closeModal() {
    const modal = document.getElementById('myModal');
    modal!.classList.remove('show');
    modal!.style.display = 'none';
    document.body.classList.remove('modal-open');

    window.location.reload();
  }

  preventClose(event: any) {
    event.stopPropagation();
  }

  onDocumentChange(): void {
    if (this.selectedDocument === 'sample1')
      this.markUrl = 'http://localhost:5984/sapas/MarksTesting1';
    else if (this.selectedDocument === 'sample2')
      this.markUrl = 'http://localhost:5984/sapas/MarksTesting2';
    else this.markUrl = 'http://localhost:5984/sapas/Marks';

    // Fetch current CGPA if current semester > 1
    if (this.currentSem > 1) {
      this.currentCGPA = parseFloat(this.stud.studentData.cgpa) || 0;
    }

    // Fetch course details for current semester
    this.fetchCourseDetails();
  }
}
