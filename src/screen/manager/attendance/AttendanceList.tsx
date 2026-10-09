import AttendanceListContainer from "../../../components/attendance/AttendanceListContainer";

const AttendanceList = () => {
  return (
    <AttendanceListContainer
      role="manager"
      title="Team Attendance"
      subtitle="Monitor punch records for your assigned locations"
    />
  );
};

export default AttendanceList;
