import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.press import PressItem, PressPage
from sqlalchemy import text

press_items = [
  {"title": "Smart India Hackathon (SIH) internal competition at the university level concludes successfully", "date": "May 24, 2024", "url": "https://drive.google.com/file/d/1oC6X59CsAuJMk2Wt2QRrhTKNyhkc1Vbt/view?usp=sharing", "description": "A-Hub's internal SIH competition concluded with top-performing student teams advancing to the national round.", "source": "A-Hub Official", "tag": "Event"},
  {"title": "Ā-hub launches early stage grant programme to empower innovators", "date": "May 10, 2024", "url": "https://www.thehansindia.com/andhra-pradesh/-hub-launches-early-stage-grant-programme-to-empower-innovators-817465", "description": "A new grant programme offers seed funding and mentorship support to early-stage innovators within the ecosystem.", "source": "The Hans India", "tag": "Funding"},
  {"title": "Andhra University Incubation Centre invites applications for NIDHI grants", "date": "Apr 28, 2024", "url": "https://www.thehindu.com/news/cities/Visakhapatnam/andhra-university-incubation-centre-in-visakhapatnam-invites-applications-from-innovators-start-ups-for-nidhi-grants/article67177119.ece", "description": "AUIC calls on innovators and startups to apply for DST-NIDHI grants to accelerate product development.", "source": "The Hindu", "tag": "Grants"},
  {"title": "Andhra varsity's A-Hub turning into premier incubation centre", "date": "Apr 15, 2024", "url": "https://www.bizzbuzz.news/industry/andhra-varsitys-a-hub-turning-into-premier-incubation-centre-1237374", "description": "A-Hub is rapidly establishing itself as a leading incubation centre in South India, nurturing hundreds of startups.", "source": "BizzBuzz", "tag": "Recognition"},
  {"title": "A-Hub entrepreneurs raise \u20b968 cr funds in 1 yr", "date": "Apr 05, 2024", "url": "https://timesofindia.indiatimes.com/city/visakhapatnam/a-hub-entrepreneurs-raise-68-cr-funds-in-1-yr/articleshow/101841976.cms?from=mdr", "description": "Startups incubated at A-Hub collectively raised \u20b968 crores in funding within a single year.", "source": "Times of India", "tag": "Funding"},
  {"title": "STPI to set up incubation centre at Andhra varsity", "date": "Mar 20, 2024", "url": "https://timesofindia.indiatimes.com/city/visakhapatnam/stpi-to-set-up-incubation-centre-at-andhra-varsity/articleshow/101529821.cms?from=mdr", "description": "Software Technology Parks of India partners with Andhra University to establish a dedicated tech incubation facility.", "source": "Times of India", "tag": "Partnership"},
  {"title": "Technology Park to Come Up on AU Campus", "date": "Mar 12, 2024", "url": "https://www.deccanchronicle.com/education/040723/andhra-university-campus-to-get-tech-park.html", "description": "A state-of-the-art technology park is planned for the Andhra University campus to boost innovation and industry linkages.", "source": "Deccan Chronicle", "tag": "Infrastructure"},
  {"title": "AU Prof H Purushotham on Start-up India Seed Fund Committee", "date": "Feb 28, 2024", "url": "https://globalgreenews.com/2023/06/13/visakhapatnam-au-prof-h-purushotham-on-start-up-india-seed-fund-committee/", "description": "A-Hub's faculty lead joins the national Startup India Seed Fund Committee, bringing institutional expertise to policy.", "source": "Global GreeNews", "tag": "Leadership"},
  {"title": "Space startup ties up with French forum", "date": "Feb 18, 2024", "url": "https://timesofindia.indiatimes.com/city/visakhapatnam/space-startup-ties-up-with-french-forum/articleshow/100908572.cms?from=mdr", "description": "A-Hub incubated space-tech startup partners with a prestigious French aerospace forum to advance clean-space missions.", "source": "Times of India", "tag": "Global"},
  {"title": "Young entrepreneurs on their way to revolutionise space technology", "date": "Feb 01, 2024", "url": "https://newindianexpress.com/good-news/2023/jun/11/young-entrepreneurs-on-their-way-to-revolutionise-space-technology-2583949.html", "description": "Student-founded space ventures from A-Hub are building next-gen satellite and propulsion technology.", "source": "New Indian Express", "tag": "Innovation"},
  {"title": "AP startup Taramandal teams up with PPF on clean space mission", "date": "Jan 20, 2024", "url": "https://www.bizzbuzz.news/eco-buzz/ap-startup-taramandal-teams-up-with-ppf-on-clean-space-mission-1225040", "description": "Taramandal, an A-Hub alumnus, collaborates with PPF to launch a debris-removal clean space mission.", "source": "BizzBuzz", "tag": "Space Tech"},
  {"title": "A Hub, TiE-AP hold meet on future of work", "date": "Jan 10, 2024", "url": "https://www.bizzbuzz.news/industry/a-hub-tie-ap-hold-meet-on-future-of-work-1222271", "description": "A-Hub and TiE-AP co-host a leadership roundtable exploring the evolving nature of work for startups.", "source": "BizzBuzz", "tag": "Community"},
  {"title": "Andhra University focus on empowering students", "date": "Dec 15, 2023", "url": "https://www.thehansindia.com/news/cities/visakhapatnam/andhra-university-focus-on-empowering-students-794625", "description": "Andhra University doubles down on student entrepreneurship with structured incubation pathways and support programmes.", "source": "The Hans India", "tag": "Education"},
  {"title": "Research scholars develop Compact Transcranial Magnetic Stimulator", "date": "Nov 28, 2023", "url": "https://www.thehindu.com/news/cities/Visakhapatnam/visakhapatnam-research-scholars-at-andhra-university-incubation-centre-develop-compact-repetitive-transcranial-magnetic-stimulator/article66746679.ece", "description": "AUIC researchers create a compact medical device that could democratise TMS therapy across tier-2 healthcare settings.", "source": "The Hindu", "tag": "MedTech"},
  {"title": "100 teams take part in a-Hub hackathon", "date": "Oct 20, 2023", "url": "https://www.bizzbuzz.news/industry/100-teams-take-part-in-a-hub-hackathon-1194348", "description": "A-Hub's flagship hackathon attracted over 100 teams competing to solve real-world problems across sectors.", "source": "BizzBuzz", "tag": "Event"},
  {"title": "Andhra University's pharma centre Element to drive cheap drug discovery", "date": "Sep 05, 2023", "url": "https://timesofindia.indiatimes.com/city/visakhapatnam/andhra-universitys-pharma-centre-element-to-drive-cheap-drug-discovery/articleshow/95870046.cms", "description": "The Element pharma centre at AUIC is pioneering affordable drug discovery models using AI and computational chemistry.", "source": "Times of India", "tag": "Pharma"},
  {"title": "Andhra varsity shines in innovation rankings", "date": "Aug 18, 2023", "url": "https://timesofindia.indiatimes.com/city/visakhapatnam/andhra-varsity-shines-in-innovation-rankings/articleshow/95648905.cms", "description": "Andhra University climbs national innovation rankings, reflecting the sustained impact of its incubation ecosystem.", "source": "Times of India", "tag": "Recognition"},
  {"title": "Andhra varsity opens Next Gen Tech incubation centre with 25 startups", "date": "Jul 10, 2023", "url": "https://www.thehansindia.com/business/andhra-varsity-opens-next-gen-tech-incubation-centre-with-25-startups-737916", "description": "The Next Gen Tech incubation centre officially launches with 25 resident startups across deep tech and software sectors.", "source": "The Hans India", "tag": "Milestone"},
  {"title": "Union minister says AI, IoT will change tech landscape", "date": "Jun 01, 2023", "url": "https://www.deccanchronicle.com/nation/in-other-news/011221/union-minister-says-ai-iot-will-change-tech-landscape.html", "description": "At an A-Hub summit, the Union minister highlighted AI and IoT as transformative forces for India's startup ecosystem.", "source": "Deccan Chronicle", "tag": "Policy"},
  {"title": "Andhra University incubation hub looks to drive innovation in AP", "date": "Apr 15, 2023", "url": "https://timesofindia.indiatimes.com/city/visakhapatnam/au-incubation-hub-looks-to-drive-innovation-in-ap/articleshow/82185595.cms", "description": "AUIC sets its sights on becoming the innovation anchor for Andhra Pradesh, partnering with government and industry.", "source": "Times of India", "tag": "Strategy"},
]

db = SessionLocal()

existing = db.execute(text("SELECT COUNT(*) FROM press_items")).scalar()
if existing == 0:
    for i, item in enumerate(press_items):
        pi = PressItem(
            title=item["title"],
            date=item["date"],
            url=item["url"],
            description=item["description"],
            source=item["source"],
            tag=item["tag"],
            display_order=i
        )
        db.add(pi)
    db.commit()
    print(f"Seeded {len(press_items)} press items")
else:
    print(f"Press items already exist ({existing} rows)")

page_count = db.execute(text("SELECT COUNT(*) FROM press_page")).scalar()
if page_count == 0:
    pp = PressPage(heading="Press", subheading="Latest news, press releases & media coverage from our innovation ecosystem.")
    db.add(pp)
    db.commit()
    print("Seeded press page settings")
else:
    print("Press page settings already exist")

db.close()
print("Done")
