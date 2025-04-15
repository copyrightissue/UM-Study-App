import { useRouter } from 'next/router';

export default function ClassPage() {
  const router = useRouter();
  const { course_code } = router.query;

  return (
    <div>
      <h1>Course Details for {course_code}</h1>
      {/* You can use course_code to fetch or display more data */}
    </div>
  );
}
