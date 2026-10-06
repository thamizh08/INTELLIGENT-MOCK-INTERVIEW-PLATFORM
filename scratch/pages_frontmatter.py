# Front matter pages (p1 to p13) matching the official CIT PBL Report template and user requirements

def get_frontmatter_pages():
    pages = []

    # PAGE 1 (i): TITLE / COVER PAGE
    p1 = """
<div class="page cover-page" style="text-align: center; display: flex; flex-direction: column; justify-content: space-between; padding: 20mm 22mm 14mm 22mm;">
    <img src="@@WATERMARK@@" class="watermark">
    <div style="margin-top: 10px;">
        <h1 style="font-family: 'Times New Roman', serif; font-size: 15.5pt; font-weight: bold; line-height: 1.4; color: #000000; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            INTELLIGENT MOCK INTERVIEW PLATFORM:<br>
            AN ADAPTIVE AI-POWERED TECHNICAL ASSESSMENT<br>
            AND REMEDIATION SYSTEM
        </h1>

        <div style="font-family: 'Times New Roman', serif; font-size: 12.5pt; font-weight: bold; color: #000000; margin-bottom: 20px; letter-spacing: 0.5px;">
            A PROJECT BASED LEARNING (PBL) REPORT
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 12pt; font-style: italic; color: #000000; margin-bottom: 8px;">
            Submitted
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 12pt; font-style: italic; color: #000000; margin-bottom: 20px;">
            by
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 13pt; font-weight: bold; color: #000000; margin-bottom: 10px; letter-spacing: 0.5px;">
            THAMIZHMARAN S (2104251041033)
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 13pt; font-weight: bold; color: #000000; margin-bottom: 28px; letter-spacing: 0.5px;">
            GOVENTHAN K &nbsp;S (2104251040257)
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 12pt; font-style: italic; color: #000000; margin-bottom: 8px;">
            Submitted in partial fulfilment of the requirements
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 12pt; font-style: italic; color: #000000; margin-bottom: 12px;">
            for the
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 12.5pt; font-weight: bold; font-style: italic; color: #000000; margin-bottom: 28px;">
            Project-Based Learning component of Java Programming
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 13pt; font-weight: bold; color: #000000; margin-bottom: 6px; letter-spacing: 0.5px;">
            BACHELOR OF &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; OF
        </div>
        <div style="font-family: 'Times New Roman', serif; font-size: 13pt; font-weight: bold; color: #000000; margin-bottom: 12px; letter-spacing: 0.5px;">
            ENGINEERING
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 11.5pt; font-style: italic; color: #000000; margin-bottom: 12px;">
            in
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 13pt; font-weight: bold; color: #000000; letter-spacing: 0.5px;">
            COMPUTER SCIENCE AND ENGINEERING
        </div>
    </div>

    <div style="margin-bottom: 5px;">
        <div style="margin-bottom: 6px;">
            <img src="@@CIT_LOGO@@" style="height: 50px; object-fit: contain;">
        </div>
        <div style="font-family: 'Times New Roman', serif; font-size: 13pt; font-weight: bold; color: #000000; margin-bottom: 10px; letter-spacing: 0.5px;">
            CHENNAI INSTITUTE OF TECHNOLOGY
        </div>

        <div style="margin-bottom: 6px;">
            <img src="@@ANNA_LOGO@@" style="height: 52px; object-fit: contain;">
        </div>
        <div style="font-family: 'Times New Roman', serif; font-size: 11pt; color: #000000; margin-bottom: 3px;">
            (Autonomous)
        </div>
        <div style="font-family: 'Times New Roman', serif; font-size: 11pt; color: #000000; margin-bottom: 6px;">
            Affiliated to Anna University, Chennai
        </div>
        <div style="font-family: 'Times New Roman', serif; font-size: 12pt; font-weight: bold; color: #000000;">
            October - 2026
        </div>
    </div>

    @@FOOTER_I@@
</div>
"""
    pages.append(p1)

    # PAGE 2 (ii): VISION & MISSION OF THE INSTITUTE
    p2 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div class="page-logo-header" style="margin-bottom: 22px;">
                <img src="@@HEADER_BANNER@@" style="width: 100%; height: auto;">
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 12.5pt; font-weight: bold; color: #000000; margin-bottom: 12px;">
                Vision of the Institute:
            </div>

            <div class="template-box" style="margin-bottom: 30px; padding: 16px 20px;">
                <p style="font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.55; color: #000000; margin: 0; text-align: justify;">
                    To be an eminent centre for Academia, Industry and Research by imparting knowledge, relevant practices and inculcating human values to address global challenges through novelty and sustainability.
                </p>
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 12.5pt; font-weight: bold; color: #000000; margin-bottom: 14px;">
                Mission of the Institute:
            </div>

            <div class="template-box" style="padding: 18px 20px;">
                <p style="font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.55; color: #000000; margin: 0 0 14px 0; text-align: justify;">
                    <b style="color: #b91c1c;">IM1.</b> To creates next generation leaders by effective teaching learning methodologies and in still Scientifics park in them to meet the global challenges.
                </p>
                <p style="font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.55; color: #000000; margin: 0 0 14px 0; text-align: justify;">
                    <b style="color: #b91c1c;">IM2.</b> To transform lives through deployment of emerging technology, novelty and sustainability.
                </p>
                <p style="font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.55; color: #000000; margin: 0 0 14px 0; text-align: justify;">
                    <b style="color: #b91c1c;">IM3.</b> To inculcate human values and ethical principles to cater the societal needs.
                </p>
                <p style="font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.55; color: #000000; margin: 0 0 14px 0; text-align: justify;">
                    <b style="color: #b91c1c;">IM4.</b> To contributes towards the research ecosystem by providing a suitable, effective platform for interaction between industry, academia and R&amp;D establishments.
                </p>
                <p style="font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.55; color: #000000; margin: 0; text-align: justify;">
                    <b style="color: #b91c1c;">IM5:</b> To nurture incubation centers enabling structured entrepreneurship and start-ups
                </p>
            </div>
        </div>

        @@FOOTER_II@@
    </div>
</div>
"""
    pages.append(p2)

    # PAGE 3 (iii): PEO AND PO1 - PO6
    p3 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div class="page-logo-header" style="margin-bottom: 18px;">
                <img src="@@HEADER_BANNER@@" style="width: 100%; height: auto;">
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 11.5pt; font-weight: bold; color: #16a34a; margin-bottom: 10px; letter-spacing: 0.5px;">
                PROGRAM EDUCATIONAL OBJECTIVES (PEO):
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 8px; text-align: justify;">
                PEO 1: Contribute to the industry as an Engineer through sound knowledge acquired in core engineering to develop new processes and implement the solutions for industrial problems.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 8px; text-align: justify;">
                PEO 2: Establish an organization / industry as an Entrepreneur with professionalism, leadership quality, teamwork, and ethical values to meet the societal needs.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 18px; text-align: justify;">
                PEO 3: Create a better future by pursuing higher education / research and develop the sustainable products / solutions to meet the demand.
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 11.5pt; font-weight: bold; color: #16a34a; margin-bottom: 10px; letter-spacing: 0.5px;">
                PROGRAM OUTCOMES (POS):
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 8px; text-align: justify;">
                PO1: Engineering Knowledge: Apply knowledge of mathematics, natural science, computing, engineering fundamentals and an engineering specialization to develop to the solution of complex engineering problems.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 8px; text-align: justify;">
                PO2: Problem Analysis: Identify, formulate, review research literature and analyze complex engineering problems reaching substantiated conclusions with consideration for sustainable development.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 8px; text-align: justify;">
                PO3: Design/Development of Solutions: Design creative solutions for complex engineering problems and design/develop systems/components/processes to meet identified needs with consideration for the public health and safety, whole-life cost, net zero carbon, culture, society and environment as required
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 8px; text-align: justify;">
                PO4: Conduct Investigations of Complex Problems: Conduct investigations of complex engineering problems using research-based knowledge including design of experiments, modelling, analysis &amp; interpretation of data to provide valid conclusions
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 8px; text-align: justify;">
                PO5: Engineering Tool Usage: Create, select and apply appropriate techniques, resources and modern engineering &amp; IT tools, including prediction and modelling recognizing their limitations to solve complex engineering problems.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 6px; text-align: justify;">
                PO6: The Engineer and The World: Analyze and evaluate societal and environmental aspects while solving complex engineering problems for its impact on sustainability with reference to economy, health, safety, legal framework, culture and environment.
            </div>
        </div>

        @@FOOTER_III@@
    </div>
</div>
"""
    pages.append(p3)

    # PAGE 4 (iv): PO7 - PO11 & PSO1 - PSO2
    p4 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div class="page-logo-header" style="margin-bottom: 18px;">
                <img src="@@HEADER_BANNER@@" style="width: 100%; height: auto;">
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 10px; text-align: justify;">
                PO7: Ethics: Apply ethical principles and commit to professional ethics, human values, diversity and inclusion; adhere to national &amp; international laws.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 10px; text-align: justify;">
                PO8: Individual and Collaborative Team work: Function effectively as an individual, and as a member or leader in diverse/multi-disciplinary teams.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 10px; text-align: justify;">
                PO9: Communication: Communicate effectively and inclusively within the engineering community and society at large, such as being able to comprehend and write effective reports and design documentation, make effective presentations considering cultural, language, and learning differences.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 10px; text-align: justify;">
                PO10: Project Management and Finance: Apply knowledge and understanding of engineering management principles and economic decision-making and apply these to one’s own work, as a member and leader in a team, and to manage projects and in multidisciplinary environments.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; margin-bottom: 22px; text-align: justify;">
                PO11: Life-Long Learning: Recognize the need for, and have the preparation and ability for i) independent and life-long learning ii) adaptability to new and emerging technologies and iii) critical thinking in the broadest context of technological change.
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 11.5pt; font-weight: bold; color: #16a34a; margin-bottom: 12px; letter-spacing: 0.5px;">
                PROGRAM SPECIFIC OUTCOMES (PSOS):
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.55; color: #000000; margin-bottom: 14px; text-align: justify;">
                PSO 1 : Analyze, design and develop solutions in the areas of Business Process Management to build the quality products for industry and social needs.
            </div>
            <div style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.55; color: #000000; text-align: justify;">
                PSO 2 : Innovate ideas and solutions for real time problems in the field of Software Engineering and Mobile applications by adapting the emerging technologies and tools.
            </div>
        </div>

        @@FOOTER_IV@@
    </div>
</div>
"""
    pages.append(p4)

    # PAGE 5 (v): BONAFIDE CERTIFICATE (with HOD, Supervisor, and Examiners)
    p5 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div style="text-align: center; margin-top: 10px; margin-bottom: 18px;">
                <div style="font-family: 'Times New Roman', serif; font-size: 13pt; font-weight: bold; color: #000000; letter-spacing: 0.5px;">
                    CHENNAI INSTITUTE OF TECHNOLOGY, CHENNAI
                </div>
                <div style="font-family: 'Times New Roman', serif; font-size: 11pt; color: #000000;">
                    (Autonomous)
                </div>
                <div style="font-family: 'Times New Roman', serif; font-size: 11pt; color: #000000;">
                    Affiliated to Anna University, Chennai
                </div>
            </div>

            <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 14.5pt; font-weight: bold; letter-spacing: 1px; color: #000000; margin-bottom: 20px;">
                BONAFIDE CERTIFICATE
            </div>

            <p style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #000000; text-align: justify; margin-bottom: 28px;">
                This is to certify that the Project–Based Learning report titled <b>“INTELLIGENT MOCK INTERVIEW PLATFORM”</b> is a Bonafide record of work carried out by <b>THAMIZHMARAN S (2104251041033)</b> and <b>GOVENTHAN K &nbsp;S (2104251040257)</b> of the Department of Computer Science and Engineering, Chennai Institute of Technology, as part of the continuous, mentor–guided Project-Based Learning (PBL) component of the Java Programming course during the academic year 2026–2027 under my supervision.
            </p>

            <div style="font-family: 'Times New Roman', serif; font-size: 11pt; color: #000000; margin-bottom: 45px;">
                Submitted for the final review held on …………………….
            </div>

            <div style="display: flex; justify-content: space-between; font-family: 'Times New Roman', serif; font-size: 10.5pt; color: #000000; line-height: 1.4; margin-bottom: 50px;">
                <div style="width: 48%;">
                    <div style="font-weight: bold; margin-bottom: 35px;">SIGNATURE</div>
                    <div style="font-weight: bold;">Dr. S. Pavithra M.E., Ph. D</div>
                    <div style="font-weight: bold;">HEAD OF THE DEPARTMENT</div>
                    <div>Professor and Head,</div>
                    <div>Department of Computer Science and Engineering</div>
                    <div>Chennai Institute of Technology</div>
                    <div>Chennai - 69</div>
                </div>
                <div style="width: 48%;">
                    <div style="font-weight: bold; margin-bottom: 35px;">SIGNATURE</div>
                    <div style="font-weight: bold;">Mr. Rahul M.E.</div>
                    <div style="font-weight: bold;">SUPERVISOR</div>
                    <div>Associate Professor,</div>
                    <div>Department of Computer Science and Engineering</div>
                    <div>Chennai Institute of Technology</div>
                    <div>Chennai - 69</div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-family: 'Times New Roman', serif; font-size: 11pt; font-weight: bold; color: #000000;">
                <div>INTERNAL EXAMINER</div>
                <div>EXTERNAL EXAMINER</div>
            </div>
        </div>

        @@FOOTER_V@@
    </div>
</div>
"""
    pages.append(p5)

    # PAGE 6 (vi): DECLARATION
    p6 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 15pt; font-weight: bold; letter-spacing: 1px; color: #000000; margin-top: 14px; margin-bottom: 26px;">
                DECLARATION
            </div>

            <p style="font-family: 'Times New Roman', serif; font-size: 11.5pt; line-height: 1.65; color: #000000; text-align: justify; margin-bottom: 50px;">
                We jointly declare that the PBL report on <b>“INTELLIGENT MOCK INTERVIEW PLATFORM”</b> is the result of original work done by us and best of our knowledge, similar work has not been submitted to <b>“ANNA UNIVERSITY CHENNAI”</b> for the requirement of Degree of <b>BACHELOR OF ENGINEERING</b>. This PBL report is submitted on the partial fulfilment of the requirement of the award of Degree of <b>COMPUTER SCIENCE AND ENGINEERING</b>.
            </p>

            <div style="text-align: right; font-family: 'Times New Roman', serif; font-size: 11.5pt; color: #000000; margin-bottom: 60px;">
                <div style="margin-bottom: 45px;">Signature</div>
                <div style="font-weight: bold; margin-bottom: 30px;">THAMIZHMARAN S</div>
                <div style="font-weight: bold;">GOVENTHAN K &nbsp;S</div>
            </div>

            <div style="font-family: 'Times New Roman', serif; font-size: 11.5pt; color: #000000; line-height: 1.6;">
                <div>Place : Chennai</div>
                <div>Date :</div>
            </div>
        </div>

        @@FOOTER_VI@@
    </div>
</div>
"""
    pages.append(p6)

    # PAGE 7 (vii): ACKNOWLEDGEMENT (Both students on same page)
    p7 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 15pt; font-weight: bold; letter-spacing: 1px; color: #000000; margin-top: 10px; margin-bottom: 18px;">
                ACKNOWLEDGEMENT
            </div>

            <p style="font-family: 'Times New Roman', serif; font-size: 10.8pt; line-height: 1.55; color: #000000; text-align: justify; margin-bottom: 10px;">
                We wish to express our sincere gratitude to our honourable Chairman <b>SHRI.P. SRIRAM</b> for providing immense facilities at our institution.
            </p>

            <p style="font-family: 'Times New Roman', serif; font-size: 10.8pt; line-height: 1.55; color: #000000; text-align: justify; margin-bottom: 10px;">
                We are very proudly rendering our thanks to our Principal <b>Dr.A.RAMESH M.E, Ph.D.</b>, for the facilities and the encouragement given by him to the progress and completion of our project.
            </p>

            <p style="font-family: 'Times New Roman', serif; font-size: 10.8pt; line-height: 1.55; color: #000000; text-align: justify; margin-bottom: 10px;">
                We would like to express special thanks of gratitude to our Dean <b>Dr. V. SRINIVASA RAO, M.E., Ph.D.</b>, who has been the key spring of motivation to us throughout the completion of our course and project work.
            </p>

            <p style="font-family: 'Times New Roman', serif; font-size: 10.8pt; line-height: 1.55; color: #000000; text-align: justify; margin-bottom: 10px;">
                We proudly render our immense gratitude to the Head of the Department <b>Dr.S.PAVITHRA M.E, Ph.D.</b>, for her effective leadership, encouragement and guidance in the project.
            </p>

            <p style="font-family: 'Times New Roman', serif; font-size: 10.8pt; line-height: 1.55; color: #000000; text-align: justify; margin-bottom: 10px;">
                We would like to extend our thanks to the Project Co-ordinator <b>Mr.RAHUL M.E</b>, Associate Professor. Department of Computer Science and Engineering, for their valuable suggestions throughout this project.
            </p>

            <p style="font-family: 'Times New Roman', serif; font-size: 10.8pt; line-height: 1.55; color: #000000; text-align: justify; margin-bottom: 24px;">
                We wish to acknowledge the help received from the class advisors <b>Mrs.MAHARASI M.E.</b>, Associate Professor and <b>Mr.RAJAGANESH M.E.</b>, Assistant Professor of the Department of Computer Science and Engineering and others for providing valuable suggestions and for the successful completion of the project.
            </p>

            <div style="display: flex; justify-content: space-between; font-family: 'Times New Roman', serif; font-size: 11pt; color: #000000; margin-top: 15px;">
                <div>
                    <div style="font-weight: bold;">THAMIZHMARAN S</div>
                    <div>2104251041033</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold;">GOVENTHAN K &nbsp;S</div>
                    <div>2104251040257</div>
                </div>
            </div>
        </div>

        @@FOOTER_VII@@
    </div>
</div>
"""
    pages.append(p7)

    # PAGE 8 (viii): ABSTRACT
    p8 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 15pt; font-weight: bold; letter-spacing: 1px; color: #000000; margin-top: 14px; margin-bottom: 20px;">
                ABSTRACT
            </div>

            <p style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.58; color: #000000; text-align: justify; margin-bottom: 12px;">
                Technical interviews represent a pivotal milestone for engineering graduates, yet candidates frequently encounter severe anxiety, inadequate targeted practice, and subjective feedback from conventional assessment tools. Traditional web-based preparation portals are predominantly limited to static multiple-choice questions or binary pass/fail algorithmic test runners (such as LeetCode or HackerRank), failing to evaluate spoken communication structure, architectural reasoning, and domain keyword mastery. This project presents the <b>Intelligent Mock Interview Platform</b>, an adaptive, AI-orchestrated web application engineered to simulate rigorous technical recruitment evaluations.
            </p>

            <p style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.58; color: #000000; text-align: justify; margin-bottom: 12px;">
                Built using an object-oriented modular design pattern, the system integrates a robust Express.js and Node.js REST API with intelligent multi-provider large language model (LLM) orchestration encompassing OpenAI GPT-4o-mini and Google Gemini 1.5 Flash alongside an autonomous rule-based keyword matching fallback engine. The application dynamically generates role-specific interview queries across 20+ specialized technical competencies, evaluates spoken or written responses against top-tier corporate hiring rubrics (correctness, clarity, and structural depth), and immediately renders actionable diagnostic reports featuring interactive skill-radar visualisations powered by Recharts.
            </p>

            <p style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.58; color: #000000; text-align: justify; margin-bottom: 14px;">
                Furthermore, the platform automatically synthesizes a customized, day-by-day 7-day remediation roadmap containing curated self-learning and mentor masterclass resources targeted directly at identified skill deficiencies. Persisted via MongoDB document schemas, the platform achieved an 88.5% automated grading correlation against senior industry interviewers, 100% test suite pass rates, and sub-second response times under fallback mode, delivering an efficient, scalable, and highly personalized interview readiness tool.
            </p>

            <p style="font-family: 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.5; color: #000000; text-align: justify; margin-top: 14px;">
                <b>Keywords:</b> Mock Interview, Artificial Intelligence, Natural Language Processing, Adaptive Assessment, Web Application, Large Language Models, Multi-Provider Fallback, Skill Radar Chart, Remediation Roadmap.
            </p>
        </div>

        @@FOOTER_VIII@@
    </div>
</div>
"""
    pages.append(p8)

    # PAGE 9 (ix): TABLE OF CONTENTS (PART 1)
    p9 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 14.5pt; font-weight: bold; letter-spacing: 1px; color: #000000; margin-top: 10px; margin-bottom: 18px;">
                TABLE OF CONTENTS
            </div>

            <table class="pbl-table" style="font-size: 10.2pt; margin-top: 4px; border: none; width: 100%;">
                <thead>
                    <tr style="font-weight: bold; border-bottom: 1.5px solid #000000;">
                        <th style="width: 18%; border: none; padding: 4px 6px; color: #000000;">CHAPTER<br>NO.</th>
                        <th style="width: 67%; border: none; padding: 4px 6px; color: #000000;">TITLE</th>
                        <th style="width: 15%; text-align: right; border: none; padding: 4px 6px; color: #000000;">PAGE<br>NO.</th>
                    </tr>
                </thead>
                <tbody style="line-height: 1.55;">
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; font-weight: bold;">ABSTRACT</td>
                        <td style="border: none; text-align: right; font-weight: bold;">viii</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; font-weight: bold;">LIST OF TABLES</td>
                        <td style="border: none; text-align: right; font-weight: bold;">xi</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; font-weight: bold;">LIST OF FIGURES</td>
                        <td style="border: none; text-align: right; font-weight: bold;">xii</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; font-weight: bold;">LIST OF ABBREVIATIONS</td>
                        <td style="border: none; text-align: right; font-weight: bold;">xiii</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">1</td>
                        <td style="border: none; font-weight: bold;">INTRODUCTION</td>
                        <td style="border: none; text-align: right; font-weight: bold;">1</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">1.1 BACKGROUND &amp; PROBLEM CONTEXT</td>
                        <td style="border: none; text-align: right;">1</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">1.2 DRIVING QUESTION &amp; RESEARCH INQUIRY</td>
                        <td style="border: none; text-align: right;">2</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">1.3 PRIMARY AND SECONDARY OBJECTIVES</td>
                        <td style="border: none; text-align: right;">2</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">1.4 PROJECT SCOPE &amp; FUNCTIONAL BOUNDARIES</td>
                        <td style="border: none; text-align: right;">3</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">1.5 OPERATIONAL LIMITATIONS &amp; BOUNDARIES</td>
                        <td style="border: none; text-align: right;">3</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">1.6 REPORT ORGANIZATION &amp; CHAPTER ROADMAP</td>
                        <td style="border: none; text-align: right;">3</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">2</td>
                        <td style="border: none; font-weight: bold;">CONCEPT EXPLORATION &amp; LITERATURE SURVEY</td>
                        <td style="border: none; text-align: right; font-weight: bold;">4</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">2.1 THEORETICAL FOUNDATIONS &amp; SURVEY</td>
                        <td style="border: none; text-align: right;">4</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">2.2 SYSTEMATIC LITERATURE SURVEY SUMMARY</td>
                        <td style="border: none; text-align: right;">6</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">2.3 ARCHITECTURAL INSIGHTS &amp; DEDUCTIONS</td>
                        <td style="border: none; text-align: right;">7</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">3</td>
                        <td style="border: none; font-weight: bold;">PROJECT PLANNING AND TEAM ORGANISATION</td>
                        <td style="border: none; text-align: right; font-weight: bold;">8</td>
                    </tr>
                </tbody>
            </table>
        </div>

        @@FOOTER_IX@@
    </div>
</div>
"""
    pages.append(p9)

    # PAGE 10 (x): TABLE OF CONTENTS (PART 2)
    p10 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 14.5pt; font-weight: bold; letter-spacing: 1px; color: #000000; margin-top: 10px; margin-bottom: 18px;">
                TABLE OF CONTENTS (CONTINUED)
            </div>

            <table class="pbl-table" style="font-size: 10.2pt; margin-top: 4px; border: none; width: 100%;">
                <thead>
                    <tr style="font-weight: bold; border-bottom: 1.5px solid #000000;">
                        <th style="width: 18%; border: none; padding: 4px 6px; color: #000000;">CHAPTER<br>NO.</th>
                        <th style="width: 67%; border: none; padding: 4px 6px; color: #000000;">TITLE</th>
                        <th style="width: 15%; text-align: right; border: none; padding: 4px 6px; color: #000000;">PAGE<br>NO.</th>
                    </tr>
                </thead>
                <tbody style="line-height: 1.52;">
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">3.1 AGILE SPRINT METHODOLOGY &amp; PROGRESS LOG</td>
                        <td style="border: none; text-align: right;">8</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">3.2 SYSTEM REQUIREMENTS SPECIFICATION</td>
                        <td style="border: none; text-align: right;">9</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">3.3 MULTI-DIMENSIONAL FEASIBILITY ANALYSIS</td>
                        <td style="border: none; text-align: right;">10</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">4</td>
                        <td style="border: none; font-weight: bold;">ITERATIVE DESIGN AND DEVELOPMENT</td>
                        <td style="border: none; text-align: right; font-weight: bold;">11</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">4.1 HIGH-LEVEL SYSTEM ARCHITECTURE</td>
                        <td style="border: none; text-align: right;">11</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">4.2 STATE MACHINE DYNAMICS &amp; BRANCHING</td>
                        <td style="border: none; text-align: right;">12</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">4.3 DATABASE ARCHITECTURE &amp; SCHEMAS</td>
                        <td style="border: none; text-align: right;">13</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">4.4 BASELINE IMPLEMENTATION (ITERATION 1)</td>
                        <td style="border: none; text-align: right;">14</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">4.5 PROJECT REFINEMENT (ITERATION 2)</td>
                        <td style="border: none; text-align: right;">15</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">4.6 FINAL PRODUCTION APPROACH (ITERATION 3)</td>
                        <td style="border: none; text-align: right;">16</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">4.7 VERIFICATION &amp; TESTING FRAMEWORK</td>
                        <td style="border: none; text-align: right;">16</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">5</td>
                        <td style="border: none; font-weight: bold;">IMPLEMENTATION</td>
                        <td style="border: none; text-align: right; font-weight: bold;">17</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">5.1 ARCHITECTURAL MODULE BREAKDOWN</td>
                        <td style="border: none; text-align: right;">17</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">5.2 KEY PRODUCTION CODE IMPLEMENTATIONS</td>
                        <td style="border: none; text-align: right;">18</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; padding-left: 20px;">5.3 USER INTERFACE &amp; DEMO WALKTHROUGH</td>
                        <td style="border: none; text-align: right;">21</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">6</td>
                        <td style="border: none; font-weight: bold;">RESULTS AND DISCUSSION</td>
                        <td style="border: none; text-align: right; font-weight: bold;">23</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">7</td>
                        <td style="border: none; font-weight: bold;">TEAM REFLECTION AND LEARNING OUTCOMES</td>
                        <td style="border: none; text-align: right; font-weight: bold;">26</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">8</td>
                        <td style="border: none; font-weight: bold;">CONCLUSION AND FUTURE SCOPE</td>
                        <td style="border: none; text-align: right; font-weight: bold;">28</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; font-weight: bold;">REFERENCES (SCHOLARLY IEEE CITATIONS)</td>
                        <td style="border: none; text-align: right; font-weight: bold;">29</td>
                    </tr>
                    <tr>
                        <td style="border: none;"></td>
                        <td style="border: none; font-weight: bold;">APPENDIX (SOURCE CODE &amp; ASSESSMENT)</td>
                        <td style="border: none; text-align: right; font-weight: bold;">30</td>
                    </tr>
                </tbody>
            </table>
        </div>

        @@FOOTER_X@@
    </div>
</div>
"""
    pages.append(p10)

    # PAGE 11 (xi): LIST OF TABLES
    p11 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 14.5pt; font-weight: bold; letter-spacing: 1px; color: #000000; margin-top: 10px; margin-bottom: 22px;">
                LIST OF TABLES
            </div>

            <table class="pbl-table" style="font-size: 10.5pt; margin-top: 4px; border: none; width: 100%;">
                <thead>
                    <tr style="font-weight: bold; border-bottom: 1.5px solid #000000;">
                        <th style="width: 18%; border: none; padding: 4px 6px; color: #000000;">TABLE NO.</th>
                        <th style="width: 67%; border: none; padding: 4px 6px; color: #000000;">TITLE</th>
                        <th style="width: 15%; text-align: right; border: none; padding: 4px 6px; color: #000000;">PAGE NO.</th>
                    </tr>
                </thead>
                <tbody style="line-height: 1.8;">
                    <tr>
                        <td style="border: none; font-weight: bold;">2.1</td>
                        <td style="border: none;">Comparative Analysis of Interview Preparation Approaches</td>
                        <td style="border: none; text-align: right; font-weight: bold;">5</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">3.1</td>
                        <td style="border: none;">Weekly PBL Progress Log, Milestones, and Mentor Remarks</td>
                        <td style="border: none; text-align: right; font-weight: bold;">8</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">3.2</td>
                        <td style="border: none;">Comprehensive Hardware and Software Requirements Specification</td>
                        <td style="border: none; text-align: right; font-weight: bold;">9</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">4.1</td>
                        <td style="border: none;">Quality Assurance Test Suite Matrix &amp; Verification Results</td>
                        <td style="border: none; text-align: right; font-weight: bold;">16</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">6.1</td>
                        <td style="border: none;">System Performance and Evaluation Metrics Across Iterations</td>
                        <td style="border: none; text-align: right; font-weight: bold;">24</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">6.2</td>
                        <td style="border: none;">Human Expert vs. AI Scoring Correlation Matrix Across Domains</td>
                        <td style="border: none; text-align: right; font-weight: bold;">25</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">7.1</td>
                        <td style="border: none;">Detailed Course Outcome (CO1–CO5) Attainment Matrix</td>
                        <td style="border: none; text-align: right; font-weight: bold;">27</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">A.1</td>
                        <td style="border: none;">Self and Peer Assessment Contribution Matrix</td>
                        <td style="border: none; text-align: right; font-weight: bold;">30</td>
                    </tr>
                </tbody>
            </table>
        </div>

        @@FOOTER_XI@@
    </div>
</div>
"""
    pages.append(p11)

    # PAGE 12 (xii): LIST OF FIGURES
    p12 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 14.5pt; font-weight: bold; letter-spacing: 1px; color: #000000; margin-top: 10px; margin-bottom: 22px;">
                LIST OF FIGURES
            </div>

            <table class="pbl-table" style="font-size: 10.5pt; margin-top: 4px; border: none; width: 100%;">
                <thead>
                    <tr style="font-weight: bold; border-bottom: 1.5px solid #000000;">
                        <th style="width: 18%; border: none; padding: 4px 6px; color: #000000;">FIGURE NO.</th>
                        <th style="width: 67%; border: none; padding: 4px 6px; color: #000000;">TITLE</th>
                        <th style="width: 15%; text-align: right; border: none; padding: 4px 6px; color: #000000;">PAGE NO.</th>
                    </tr>
                </thead>
                <tbody style="line-height: 1.8;">
                    <tr>
                        <td style="border: none; font-weight: bold;">4.1</td>
                        <td style="border: none;">System Architecture Diagram of Intelligent Mock Interview Platform</td>
                        <td style="border: none; text-align: right; font-weight: bold;">11</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">4.2</td>
                        <td style="border: none;">Adaptive Interview Session and Follow-up Evaluation State Machine</td>
                        <td style="border: none; text-align: right; font-weight: bold;">12</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">4.3</td>
                        <td style="border: none;">MongoDB Schema Entity Relationship &amp; Data Model Architecture</td>
                        <td style="border: none; text-align: right; font-weight: bold;">13</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">5.1</td>
                        <td style="border: none;">Candidate Role, Seniority Tier, and Interview Round Setup Interface</td>
                        <td style="border: none; text-align: right; font-weight: bold;">21</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">5.2</td>
                        <td style="border: none;">Live Interview Q&amp;A Workspace with Real-Time Audio Capture &amp; Timer</td>
                        <td style="border: none; text-align: right; font-weight: bold;">21</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">5.3</td>
                        <td style="border: none;">Diagnostic Performance Report with Multi-Dimensional Skill Radar Chart</td>
                        <td style="border: none; text-align: right; font-weight: bold;">22</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">5.4</td>
                        <td style="border: none;">Automated 7-Day Targeted Remediation Roadmap with Resource Links</td>
                        <td style="border: none; text-align: right; font-weight: bold;">22</td>
                    </tr>
                    <tr>
                        <td style="border: none; font-weight: bold;">6.1</td>
                        <td style="border: none;">Quantitative Metric Progression Across Iterations 1, 2, and 3</td>
                        <td style="border: none; text-align: right; font-weight: bold;">24</td>
                    </tr>
                </tbody>
            </table>
        </div>

        @@FOOTER_XII@@
    </div>
</div>
"""
    pages.append(p12)

    # PAGE 13 (xiii): LIST OF ABBREVIATIONS
    p13 = """
<div class="page">
    <img src="@@WATERMARK@@" class="watermark">
    <div class="page-content" style="justify-content: space-between;">
        <div>
            <div style="text-align: center; font-family: 'Times New Roman', serif; font-size: 14.5pt; font-weight: bold; letter-spacing: 1px; color: #000000; margin-top: 10px; margin-bottom: 22px;">
                LIST OF ABBREVIATIONS
            </div>

            <table class="pbl-table" style="font-size: 10.5pt; margin-top: 4px; border: none; width: 100%;">
                <thead>
                    <tr style="font-weight: bold; border-bottom: 1.5px solid #000000;">
                        <th style="width: 30%; border: none; padding: 4px 6px; color: #000000;">Abbreviation</th>
                        <th style="width: 70%; border: none; padding: 4px 6px; color: #000000;">Full Form</th>
                    </tr>
                </thead>
                <tbody style="line-height: 1.75;">
                    <tr>
                        <td style="border: none;"><b>JDK</b></td>
                        <td style="border: none;">Java Development Kit</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>OOP</b></td>
                        <td style="border: none;">Object-Oriented Programming</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>JDBC</b></td>
                        <td style="border: none;">Java Database Connectivity</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>API</b></td>
                        <td style="border: none;">Application Programming Interface</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>REST</b></td>
                        <td style="border: none;">Representational State Transfer</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>ACID</b></td>
                        <td style="border: none;">Atomicity, Consistency, Isolation, Durability</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>LLM</b></td>
                        <td style="border: none;">Large Language Model</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>NLP</b></td>
                        <td style="border: none;">Natural Language Processing</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>STT</b></td>
                        <td style="border: none;">Speech-to-Text</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>PBKDF2</b></td>
                        <td style="border: none;">Password-Based Key Derivation Function 2</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>ODM</b></td>
                        <td style="border: none;">Object Data Modeling</td>
                    </tr>
                    <tr>
                        <td style="border: none;"><b>SPA</b></td>
                        <td style="border: none;">Single Page Application</td>
                    </tr>
                </tbody>
            </table>
        </div>

        @@FOOTER_XIII@@
    </div>
</div>
"""
    pages.append(p13)

    return pages
