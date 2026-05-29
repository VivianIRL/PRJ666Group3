import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ImmigrationDetails() {
    const navigate = useNavigate()

    async function handleFormSubmit(formData) {
        await formData
        if (!formData.get('firstName')) {
            alert('ERROR: First name is empty.')
            return;
        }
        if (!formData.get('lastName')) {
            alert('ERROR: Last name is empty.')
            return;
        }
        if (!formData.get('emailphone')) {
            alert('ERROR: Email or phone number is empty.')
            return;
        }
        if (!formData.get('dateofbirth')) {
            alert('ERROR: Date of birth is empty.')
            return;
        }
        if (!formData.get('password')) {
            alert('ERROR: Password is empty.')
            return;
        }
        console.log(formData)
    }

    // eslint-disable-next-line no-unused-vars
    function handleImmigrationDetails(e) {
        e.preventDefault();
        navigate('/immigration');
    }
    
    return (
        <>
            <h2 style={{ 'margin-top': "67px" }}><b>Create account with settle<span style={{ "color": "#8F0004" }}>CAN</span></b></h2>
            <div style={{ "font-size": "12.5px" }}>
                Your Journey to Canada, Simplified
            </div>
            <Form action={handleFormSubmit}>
                <div class="row" style={{'margin-top': "67px", 'padding-left': "50px",  'padding-right': "50px", "gap": "10%" }}>
                    <div class="column" style={{"text-align": "left", "inline-size": "45%"}}>
                                <Form.Group className="mb-3" controlId="formFirstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control type="name" name="firstName" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formEmailPhone">
                                    <Form.Label>Email or Phone Number</Form.Label>
                                    <Form.Control name="emailphone" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPassword">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="password" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                    </div>
                    <div class="column" style={{ "text-align": "left", "inline-size": "45%" }}>
                                <Form.Group className="mb-3" controlId="formLastName">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control type="name" name="lastName" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formDateOfBirth">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control type="date" name="dateOfBirth" style={{"background": "#F8FBFF"}}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPasswordConfirm">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type="password" name="confirmPassword" style={{"background": "#F8FBFF"}}/>
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
                    <div>Have an account? <Link to="/login">Log in</Link></div>
                </section>
            </Form>
        </>
    )
}

export default ImmigrationDetails