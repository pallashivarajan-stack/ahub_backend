import os, shutil
import pymysql

ASSETS_DIR = r"C:\project\ahub-nexus-main\src\assets\startups"
UPLOADS_DIR = r"C:\project\ahub-backend\uploads\companies"
os.makedirs(UPLOADS_DIR, exist_ok=True)

startups = [
    {"name":"Interview Buddy","slug":"interview-buddy","category":"EdTech","industry":"Education","founded_year":2021,"funding_stage":"Seed","description":"AI-powered mock interview and placement readiness platform helping students improve career outcomes.","website_url":"https://interviewbuddy.in","founder_name":"","popularity":95,"display_order":1,"featured":True,"image":"interview buddy.png"},
    {"name":"Edumoon","slug":"edumoon","category":"EdTech","industry":"Education","founded_year":2020,"funding_stage":"Pre-Seed","description":"Community-led skill-building platform empowering students through mentorship and career readiness.","founder_name":"","popularity":88,"display_order":2,"featured":True,"image":"edumoon.png"},
    {"name":"GreenJams","slug":"greenjams","category":"CleanTech","industry":"Sustainability","founded_year":2019,"funding_stage":"Seed","description":"Carbon-negative building materials startup creating sustainable alternatives for construction.","website_url":"https://greenjams.com","founder_name":"","popularity":92,"display_order":3,"featured":True,"image":"greenjams_logo.jpg"},
    {"name":"Pick A Book","slug":"pick-a-book","category":"EdTech","industry":"Education","founded_year":2022,"funding_stage":"Pre-Seed","description":"Reading habit platform fostering continuous learning and youth engagement through curated book clubs.","founder_name":"","popularity":76,"display_order":4,"featured":True,"image":"pick a book.png"},
    {"name":"Sweya","slug":"sweya","category":"HealthTech","industry":"Healthcare","founded_year":2021,"funding_stage":"Seed","description":"Digital health platform improving patient outcomes through smart monitoring and care coordination.","founder_name":"","popularity":82,"display_order":5,"featured":True,"image":"sweya.png"},
    {"name":"SandLogic","slug":"sandlogic","category":"AI","industry":"Deep Tech","founded_year":2019,"funding_stage":"Series A","description":"AI and voice technology products powering enterprise automation and intelligent interfaces.","website_url":"https://sandlogic.com","founder_name":"","popularity":91,"display_order":6,"featured":True,"image":"sandlogic.png"},
    {"name":"iCompass","slug":"icompass","category":"EdTech","industry":"Education","founded_year":2020,"funding_stage":"Pre-Seed","description":"Career guidance platform helping students navigate higher education and professional pathways.","founder_name":"","popularity":74,"display_order":7,"featured":True,"image":"icompass.png"},
    {"name":"Data Foundry","slug":"data-foundry","category":"SaaS","industry":"Analytics","founded_year":2022,"funding_stage":"Seed","description":"Data infrastructure platform helping startups build analytics pipelines without heavy engineering.","founder_name":"","popularity":70,"display_order":8,"featured":True,"image":"data foundary.png"},
    {"name":"Agri DNA","slug":"agri-dna","category":"AgriTech","industry":"Agriculture","founded_year":2021,"funding_stage":"Pre-Seed","description":"Precision agriculture tools using genomics and data to improve crop yield and farmer income.","founder_name":"","popularity":68,"display_order":9,"featured":True,"image":"agri dna.jpg"},
    {"name":"Antar IoT","slug":"antar-iot","category":"IoT","industry":"Hardware","founded_year":2020,"funding_stage":"Seed","description":"Connected device solutions for smart infrastructure, monitoring, and industrial IoT deployments.","founder_name":"","popularity":72,"display_order":10,"featured":True,"image":"antar iot.png"},
    {"name":"BizPro","slug":"bizpro","category":"SaaS","industry":"Enterprise","founded_year":2023,"funding_stage":"Pre-Seed","description":"Business operations suite helping SMBs manage workflows, billing, and customer relationships.","founder_name":"","popularity":65,"display_order":11,"featured":False,"image":"bizpro.png"},
    {"name":"Austhraa Motors","slug":"austhraa-motors","category":"Mobility","industry":"Automotive","founded_year":2021,"funding_stage":"Seed","description":"Electric mobility solutions focused on sustainable transportation and smart vehicle systems.","founder_name":"","popularity":67,"display_order":12,"featured":False,"image":"austhraa_motors_logo.jpg"},
    {"name":"Billbo","slug":"billbo","category":"FinTech","industry":"Finance","founded_year":2022,"funding_stage":"Pre-Seed","description":"Simplified billing and invoicing tools for small businesses and freelance operators.","founder_name":"","popularity":60,"display_order":13,"featured":False,"image":"billbo.jpg"},
    {"name":"Cirus","slug":"cirus","category":"Deep Tech","industry":"Technology","founded_year":2020,"funding_stage":"Seed","description":"Innovation-driven technology startup building scalable products for modern enterprise needs.","founder_name":"","popularity":63,"display_order":14,"featured":False,"image":"cirus.jpg"},
    {"name":"Der Auto Bot","slug":"der-auto-bot","category":"Robotics","industry":"Automation","founded_year":2021,"funding_stage":"Pre-Seed","description":"Robotic automation solutions streamlining industrial processes and manufacturing workflows.","founder_name":"","popularity":61,"display_order":15,"featured":False,"image":"der auto bot.jpg"},
    {"name":"DigiotAI","slug":"digiotai","category":"AI","industry":"Deep Tech","founded_year":2022,"funding_stage":"Seed","description":"AI-powered digital solutions transforming business operations through intelligent automation.","founder_name":"","popularity":69,"display_order":16,"featured":False,"image":"digiotai.jpg"},
    {"name":"Furpsq","slug":"furpsq","category":"Consumer","industry":"Lifestyle","founded_year":2023,"funding_stage":"Pre-Seed","description":"Consumer-focused brand building innovative lifestyle products for modern urban audiences.","founder_name":"","popularity":55,"display_order":17,"featured":False,"image":"furpsq.jpg"},
    {"name":"Happy Drivers","slug":"happy-drivers","category":"Mobility","industry":"Transport","founded_year":2020,"funding_stage":"Seed","description":"Driver experience platform improving fleet management, safety, and on-road efficiency.","founder_name":"","popularity":64,"display_order":18,"featured":False,"image":"happy drivers.jpg"},
    {"name":"House Insta","slug":"house-insta","category":"PropTech","industry":"Real Estate","founded_year":2022,"funding_stage":"Pre-Seed","description":"Property discovery and rental platform simplifying home search for students and young professionals.","founder_name":"","popularity":58,"display_order":19,"featured":False,"image":"house insta.png"},
    {"name":"Innoccito","slug":"innoccito","category":"HealthTech","industry":"Healthcare","founded_year":2021,"funding_stage":"Seed","description":"Healthcare innovation startup delivering accessible wellness and diagnostic solutions.","founder_name":"","popularity":66,"display_order":20,"featured":False,"image":"innoccito.jpg"},
    {"name":"IPMG","slug":"ipmg","category":"Enterprise","industry":"Consulting","founded_year":2019,"funding_stage":"Seed","description":"Intellectual property and management consultancy supporting startups through growth phases.","founder_name":"","popularity":62,"display_order":21,"featured":False,"image":"ipmg.jpg"},
    {"name":"Jaitra","slug":"jaitra","category":"Deep Tech","industry":"Technology","founded_year":2022,"funding_stage":"Pre-Seed","description":"Technology venture building products that bridge research innovation and market-ready solutions.","founder_name":"","popularity":57,"display_order":22,"featured":False,"image":"jaitra.jpg"},
    {"name":"Jnana","slug":"jnana","category":"EdTech","industry":"Education","founded_year":2021,"funding_stage":"Pre-Seed","description":"Knowledge platform delivering structured learning experiences for students and professionals.","founder_name":"","popularity":59,"display_order":23,"featured":False,"image":"jnana.jpg"},
    {"name":"Joora Drone Consultants","slug":"joora","category":"Aerospace","industry":"Drones","founded_year":2020,"funding_stage":"Seed","description":"Drone consulting and solutions for surveying, agriculture, and industrial inspection applications.","founder_name":"","popularity":71,"display_order":24,"featured":False,"image":"joora_drone_consultants_logo.jpg"},
    {"name":"Matric Services","slug":"matric-services","category":"SaaS","industry":"Enterprise","founded_year":2022,"funding_stage":"Pre-Seed","description":"Operational services platform helping teams manage metrics, reporting, and business workflows.","founder_name":"","popularity":54,"display_order":25,"featured":False,"image":"matric services.png"},
    {"name":"Nest Webhost","slug":"nest-webhost","category":"SaaS","industry":"Infrastructure","founded_year":2021,"funding_stage":"Bootstrapped","description":"Web hosting and digital infrastructure services tailored for early-stage startup teams.","founder_name":"","popularity":52,"display_order":26,"featured":False,"image":"nest webhost.png"},
    {"name":"NR Techcreatz","slug":"nr-techcreatz","category":"Deep Tech","industry":"Technology","founded_year":2023,"funding_stage":"Pre-Seed","description":"Creative technology studio building digital products at the intersection of design and engineering.","founder_name":"","popularity":56,"display_order":27,"featured":False,"image":"nr techcreatz.png"},
    {"name":"Return Trucks","slug":"return-trucks","category":"Logistics","industry":"Supply Chain","founded_year":2020,"funding_stage":"Seed","description":"Logistics platform optimizing return freight and reducing empty-mile costs for transporters.","founder_name":"","popularity":73,"display_order":28,"featured":False,"image":"retruntrucks_logo.jpg"},
    {"name":"Rolls Mama","slug":"rolls-mama","category":"FoodTech","industry":"Food & Beverage","founded_year":2022,"funding_stage":"Pre-Seed","description":"Food brand delivering quality quick-service offerings with a focus on consistency and scale.","founder_name":"","popularity":53,"display_order":29,"featured":False,"image":"rolls mama.jpg"},
    {"name":"Schemax","slug":"schemax","category":"SaaS","industry":"Enterprise","founded_year":2021,"funding_stage":"Seed","description":"Schema and data management tools helping teams organize complex business information.","founder_name":"","popularity":60,"display_order":30,"featured":False,"image":"schemax.png"},
    {"name":"Sconex","slug":"sconex","category":"IoT","industry":"Hardware","founded_year":2022,"funding_stage":"Pre-Seed","description":"Connected hardware solutions enabling smarter environments and device-level automation.","founder_name":"","popularity":58,"display_order":31,"featured":False,"image":"sconex.jpg"},
    {"name":"Spice Route","slug":"spice-route","category":"FoodTech","industry":"Food & Beverage","founded_year":2019,"funding_stage":"Seed","description":"Food supply and distribution startup connecting regional producers with modern retail channels.","founder_name":"","popularity":70,"display_order":32,"featured":False,"image":"spice route.jpg"},
    {"name":"Spot Times","slug":"spot-times","category":"Media","industry":"Publishing","founded_year":2023,"funding_stage":"Pre-Seed","description":"Local news and events platform surfacing community stories and hyperlocal engagement.","founder_name":"","popularity":51,"display_order":33,"featured":False,"image":"spot times.png"},
    {"name":"Starbeat","slug":"starbeat","category":"HealthTech","industry":"Wellness","founded_year":2021,"funding_stage":"Pre-Seed","description":"Wellness technology helping users track health rhythms and build sustainable daily habits.","founder_name":"","popularity":55,"display_order":34,"featured":False,"image":"starbeat.jpg"},
    {"name":"Starry Stories","slug":"starry-stories","category":"Media","industry":"Content","founded_year":2022,"funding_stage":"Bootstrapped","description":"Storytelling platform creating engaging educational content for children and young learners.","founder_name":"","popularity":50,"display_order":35,"featured":False,"image":"starry stories.png"},
    {"name":"Talent Spotify","slug":"talentspotify","category":"HR Tech","industry":"Recruitment","founded_year":2020,"funding_stage":"Seed","description":"Talent discovery platform matching skilled professionals with high-growth startup opportunities.","founder_name":"","popularity":68,"display_order":36,"featured":True,"image":"talentspotify_logo.jpg"},
    {"name":"Taramandal","slug":"taramandal","category":"EdTech","industry":"Education","founded_year":2021,"funding_stage":"Pre-Seed","description":"Learning ecosystem inspiring curiosity and structured exploration across science and creativity.","founder_name":"","popularity":57,"display_order":37,"featured":False,"image":"taramandal.jpg"},
    {"name":"Tessrac","slug":"tessrac","category":"Deep Tech","industry":"Technology","founded_year":2022,"funding_stage":"Seed","description":"Advanced technology venture developing scalable software for data-intensive applications.","founder_name":"","popularity":62,"display_order":38,"featured":True,"image":"tessrac_logo.jpg"},
    {"name":"Train Dhaba","slug":"train-dhaba","category":"FoodTech","industry":"Hospitality","founded_year":2023,"funding_stage":"Pre-Seed","description":"Railway food service concept bringing quality dining experiences to travelers on the move.","founder_name":"","popularity":49,"display_order":39,"featured":False,"image":"train dhaba.avif"},
    {"name":"Vihaan","slug":"vihaan","category":"Deep Tech","industry":"Technology","founded_year":2021,"funding_stage":"Pre-Seed","description":"Innovation-led startup building technology products with a focus on accessibility and impact.","founder_name":"","popularity":54,"display_order":40,"featured":False,"image":"vihaan.jpg"},
    {"name":"Vyomastra","slug":"vyomastra","category":"Aerospace","industry":"Space Tech","founded_year":2022,"funding_stage":"Seed","description":"Space technology venture exploring aerospace applications and advanced engineering solutions.","founder_name":"","popularity":67,"display_order":41,"featured":True,"image":"vyomastra.jpg"},
]

conn = pymysql.connect(host='localhost', user='root', password='root123', database='ahub_db')
cur = conn.cursor()

# Clear existing
cur.execute("DELETE FROM startups")
cur.execute("ALTER TABLE startups AUTO_INCREMENT = 1")

inserted = 0
for s in startups:
    src = os.path.join(ASSETS_DIR, s["image"])
    if not os.path.exists(src):
        print(f"WARNING: Image not found: {src}")
        continue
    dst_name = s["image"].replace(" ", "_")
    dst = os.path.join(UPLOADS_DIR, dst_name)
    shutil.copy2(src, dst)
    print(f"Copied {s['image']} -> {dst}")

    logo_url = f"api/public/media/companies/{dst_name}"
    cur.execute(
        """INSERT INTO startups
           (name, logo_url, short_description, website_url, founder_name,
            display_order, category, industry, founded_year, funding_stage, featured, popularity)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (s["name"], logo_url, s["description"], s.get("website_url"),
         s.get("founder_name",""), s["display_order"], s["category"],
         s["industry"], s["founded_year"], s["funding_stage"],
         s["featured"], s["popularity"])
    )
    inserted += 1

conn.commit()
cur.close()
conn.close()
print(f"\nSeeded {inserted} startups successfully!")
