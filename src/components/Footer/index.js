import './index.css'

const Footer = () => {
    <div className="container-fluid">
        <div className="row">
            <div className="d-block col-12 d-flex flex-column justify-content-center fixed-bottom" style={{
                backgroundcolor: "#1f2126",
                color: "white",
                fontFamily: "Roboto",
                height: "150px",
                padding: "10px",
                margin: "0",
                bottom: "0"
            }}>
                <div style={{ color: "#a1a9c4" }} className="d-flex flex-row justify-content-center">
                    COPYRIGHT &copy; CDAC 2024. All rights reserved.
                </div>
                <div className="d-flex flex-row justify-content-center align-items-center" style={{ margintTop: "30px" }}>
                    <div style={{
                        width: "25px",
                        borderRadius: "15px",
                        height: "20px",
                        backgroundColor: "white",
                    }} className="d-flex flex-row justify-content-center align-items-center">
                        <a href="https://instagram.com/cdac_mumbai?igshid=YTQwZjQ0NmI0OA=="><i
                            className="fa-brands fa-square-instagram fa-sm mx-2" style={{color: "#111212"}}></i></a>
                    </div>
                    <div style={{
                        width: "25px",
                        borderRadius: "15px",
                        height: "20px",
                        backgroundColor: "white",
                    }} className="d-flex flex-row justify-content-center align-items-center mx-2">
                        <a href="https://www.youtube.com/@CDACOfficial"><i className="fa-brands fa-youtube fa-sm"
                            style={{color: "#121212"}}></i></a>
                    </div>
                    <div style={{
                        width: "25px",
                        borderRadius: "15px",
                        height: "20px",
                        backgroundColor: "white",
                    }} className="d-flex flex-row justify-content-center align-items-center mx-1">
                        <a href="https://www.linkedin.com/groups/1938488/"><i className="fa-brands fa-linkedin fa-sm"
                            style={{color: "#0d0d0d"}}></i></a>
                    </div>
                </div>
            </div>
        </div>
    </div >
}

export default Footer