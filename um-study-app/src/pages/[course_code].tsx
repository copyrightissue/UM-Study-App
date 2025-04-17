import React from "react";
import { useRouter } from "next/router";
import ClassPage from "@/components/class/[course_code]";

const CoursePage: React.FC = () => {
  const router = useRouter();
  const { course_code } = router.query;

  // Avoid rendering until the route param is available
  if (!course_code || typeof course_code !== "string") return null;

  return <ClassPage course_code={course_code} />;
};

export default CoursePage;