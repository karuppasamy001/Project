import { Component, OnInit, enableProdMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { error } from 'jquery';

@Component({
  selector: 'app-add-marks',
  templateUrl: './add-marks.component.html',
  styleUrls: ['./add-marks.component.scss'],
})
export class AddMarksComponent implements OnInit {
  staffId!: string;
  selectedSubject!: string;
  selectedAssessment!: string;
  students: any[] = [];
  assessments: string[] = ['cat1', 'cat2', 'finalResult'];
  marksData: any = {};
  subjectList: string[] = [];
  batchList: string[] = [];
  selectedBatch!: string;
  selectedSemester!: string;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.staffId = JSON.parse(localStorage.getItem('isStaff') || '{}').staffId;

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    this.http.get('http://localhost:5984/sapas/Courses', { headers }).subscribe(
      (data: any) => {
        this.batchList = Object.keys(data).filter(
          (key: string) => !key.startsWith('_')
        );
      },
      (error) => {
        console.error('Error fetching batch list:', error);
      }
    );

    this.http
      .get<any>('http://localhost:5984/sapas/StaffEnroll', { headers })
      .subscribe(
        (data: any) => {
          this.http
            .get<any>('http://localhost:5984/sapas/Courses', { headers })
            .subscribe(
              (coursesData: any) => {
                const staffEnrolledSubjects = data[this.staffId];
                const subjectList: string[] = [];

                Object.keys(coursesData).forEach((batch: string) => {
                  const courses = coursesData[batch];
                  const allSemesters = [
                    'Semester1',
                    'Semester2',
                    'Semester3',
                    'Semester4',
                  ];
                  const courseLists = allSemesters.reduce(
                    (acc: any, semester: string) => {
                      if (courses[semester]) {
                        return { ...acc, ...courses[semester] };
                      }
                      return acc;
                    },
                    {}
                  );

                  Object.keys(courseLists).forEach((subjectCode: string) => {
                    const courseName =
                      courseLists[subjectCode] || 'Unknown Course';
                    const subject = `${subjectCode} - ${courseName}`;
                    if (staffEnrolledSubjects.hasOwnProperty(subjectCode)) {
                      subjectList.push(subject);
                    }
                  });
                });

                this.subjectList = subjectList;
              },
              (error) => {
                console.error('Error fetching course list:', error);
              }
            );
        },
        (error) => {
          console.error('Error Fetching Enrolled Subject for staff', error);
        }
      );
  }

  fetchMarksForSelectedAssessment() {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });

    const url = 'http://localhost:5984/sapas/Marks';

    this.http.get(url, { headers }).subscribe(
      (marksData: any) => {
        const batch = marksData[this.selectedBatch];
        const courses = batch[this.selectedSemester];
        const assessments = courses[this.selectedSubject.slice(0, 7)];
        const assessment = assessments[this.selectedAssessment];

        this.marksData = assessment;
        this.fetchStudentsData();
      },
      (error) => {
        console.error('Error fetching  Marks data', error);
      }
    );
  }

  fetchStudentsData() {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
    });
    const url = 'http://localhost:5984/sapas/StudentData';
    this.http.get<any>(url, { headers }).subscribe(
      (data: any) => {
        if (data && data['2023']) {
          // Assuming '2023' is the batch year
          this.students = Object.values(data['2023']).map((student: any) => ({
            registrationNumber: student.registrationNumber,
            name: `${student.firstName} ${student.lastName}`,
            marks: this.marksData[student.registrationNumber] || '',
          }));
        }
      },
      (error) => {
        console.error('Error fetching student data:', error);
      }
    );
  }

  onSubmit() {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa('admin:admin'),
      'Content-Type': 'application/json',
    });
    const url = 'http://localhost:5984/sapas/Marks';

    const updatedMarksData = { ...this.marksData };
    this.students.forEach((student) => {
      updatedMarksData[student.registrationNumber] = student.marks;
    });
    const payload = {
      [this.selectedAssessment]: updatedMarksData,
    };

    console.log(payload);

    this.http.get(url, { headers }).subscribe(
      (data: any) => {
        data[this.selectedBatch][this.selectedSemester][
          this.selectedSubject.slice(0, 7)
        ] = payload;

        this.http.put(url, data, { headers }).subscribe(
          (response: any) => {
            console.log('Marks uploaded Successfully');
          },
          (error: any) => {
            console.error('Error uploading Marks', error);
          }
        );
      },
      (error: any) => {
        console.error('error fetching from database', error);
      }
    );

    // console.log(this.marksData)
  }
}
