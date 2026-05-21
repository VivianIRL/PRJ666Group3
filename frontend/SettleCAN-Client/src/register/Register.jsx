import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';

function Register() {
    return (
        <>
            <h2 style={{ 'margin-top': "67px" }}><b>Create account with settle<span style={{ "color": "#8F0004" }}>CAN</span></b></h2>
            <div style={{ "font-size": "12.5px" }}>
                Your Journey to Canada, Simplified
            </div>
            <Form>
                <div class="row" style={{'margin-top': "67px", 'padding-left': "50px",  'padding-right': "50px", "gap": "10%" }}>
                    <div class="column" style={{"text-align": "left", "inline-size": "45%"}}>
                                <Form.Group className="mb-3" controlId="formFirstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control type="name" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formEmailPhone">
                                    <Form.Label>Email or Phone Number</Form.Label>
                                    <Form.Control style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                    </div>
                    <div class="column" style={{ "text-align": "left", "inline-size": "45%" }}>
                                <Form.Group className="mb-3" controlId="formLastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control type="name" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formDateOfBirth">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control type="date" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPasswordConfirm">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type="password" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                        </div>
                    </div>
                <br/>
                <br/>
                <br/>
                <section id="center">
                    <Button variant="danger" type="submit" style={{"--bs-btn-bg": "#830C10", "display": "block", "width": "67%"}}>
                        Immigration Details
                    </Button>
                    <div>Have an account? <Link to="/">Log in</Link></div>
                </section>
            </Form>
        </>
    )
}

export default Register
