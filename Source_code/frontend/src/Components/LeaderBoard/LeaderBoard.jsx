import FeedLayout from "../Feed/Layout/FeedLayout";
import "./leaderboard.css";
import { FaTrophy } from "react-icons/fa";
import { baseURL } from "../../utils/listContainer";
import { RiCopperCoinLine } from "react-icons/ri";
import useFetchData from "../Hooks/useFetchData";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loading from "../Loading/Loading";
const LeaderBoard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user?.currentUser);
  const {
    apiData: users,
    isLoading,
    serverError,
  } = useFetchData(
    `${baseURL}/users/${user?._id}/leaderboard`,
    user?.accessToken,
    "get"
  );
  const goToUser = (id) => {
    navigate(`/user/${id}`);
  };
 
  return (
    <FeedLayout>
      <section className="leaderboard-container">
        <div className="leaderboard-header"> Leaderboard </div>
        <p className="leaderboard-topten"> Top 10 </p>
        {isLoading && (
          <Loading
            loadingType="BeatLoader"
            size="12px"
            loading={isLoading}
            color="white"
          />
        )}
        {users?.map((user, idx) => {
          return (
            <div
              key={idx}
              className={`${
                idx === 0
                  ? `leaderboard-first`
                  : idx === 1
                  ? `leaderboard-second`
                  : idx === 2
                  ? `leaderboard-third`
                  : `leaderboard-users`
              }`}
              onClick={() => goToUser(user?._id)}
            >
              <div className="leaderboard-info">
                <img
                  src={user.profilePicture}
                  className="leaderboard-img"
                  alt=""
                />
                <div className="leaderboard-name">u/{user.username}</div>
                {idx === 0 && (
                  <FaTrophy
                    size="32px"
                    color="rgb(209, 161, 1)"
                    className="trophy-first"
                  />
                )}

                <div className="leaderboard-karmas">
                  {/* <RiCopperCoinLine
                    size={"24px"}
                    color="rgb(2, 88, 158)"
                    className="karmas-logo"
                  /> */}
                  {user.karmas}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </FeedLayout>
  );
};

export default LeaderBoard;
