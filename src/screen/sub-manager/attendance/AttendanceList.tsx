import AttendanceListContainer from "../../../components/attendance/AttendanceListContainer";

const AttendanceList = () => {
  return (
    <AttendanceListContainer
      role="sub-manager"
      title="Shift Attendance"
      subtitle="Monitor punch records for your current shift and location"
    />
  );
};

export default AttendanceList;
