import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function ImmigrationDetails() {
    const navigate = useNavigate()

    async function handleFormSubmit(formData) {
        await formData
        var firstName = formData.get('firstName')
        if (!firstName) {
            alert('ERROR: First name is empty.')
            return;
        }
        var lastName = formData.get('lastName')
        if (!lastName) {
            alert('ERROR: Last name is empty.')
            return;
        }
        var emailphone = formData.get('emailphone')
        if (!emailphone) {
            alert('ERROR: Email or phone number is empty.')
            return;
        }
        var dateOB = new Date(formData.get('dateOfBirth'))
        if (!formData.get('dateOfBirth')) {
            alert('ERROR: Date of birth is empty.')
            return;
        }
        var password = formData.get('password')
        if (!password) {
            alert('ERROR: Password is empty.')
            return;
        }
        var emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gm
        var phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/g
        if (!(emailRegex.test(emailphone) || phoneRegex.test(emailphone))) {
            alert('ERROR: No valid email or phone number was given.')
            return;
        }
        var now = new Date()
        if (dateOB > now) {
            alert('ERROR: Date of birth is not in the past.')
            return;
        }
        if (password != formData.get('confirmPassword')) {
            alert('ERROR: Passwords do not match')
            return;
        }
        var registeringUser = {
            "firstName": firstName,
            "lastName": lastName,
            "dateOfBirth": dateOB,
            "emailphone": emailphone,
            "password": password
        }
        
        navigate('/immigration', { state: { "registeringUser": registeringUser }});
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