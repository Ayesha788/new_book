# Community Forum and Issue Tracker Setup Documentation

## Overview

This document provides comprehensive instructions for setting up community forums and issue tracking systems for the Physical AI & Humanoid Robotics course. These systems are essential for fostering collaboration, providing support, and maintaining the quality of the educational content.

## Community Forum Setup

### Platform Options

#### Option 1: Discourse (Recommended)
**Advantages:**
- Modern, user-friendly interface
- Excellent for technical discussions
- Strong moderation tools
- Mobile-responsive design
- Rich text editing with code formatting

**Requirements:**
- Docker or direct installation
- PostgreSQL database
- Redis for caching
- Web server (Nginx/Apache)

#### Option 2: GitHub Discussions
**Advantages:**
- Integrated with course repository
- Familiar interface for developers
- Easy access control
- Issue linking capabilities

**Requirements:**
- GitHub repository access
- Organization or personal account

#### Option 3: Discord Server
**Advantages:**
- Real-time chat capabilities
- Voice channels for live sessions
- Easy community building
- Integration with bots and tools

**Requirements:**
- Discord account
- Server creation permissions

### Discourse Forum Setup

#### 1. Docker Installation Method (Recommended)
```bash
# Create discourse directory
mkdir ~/discourse
cd ~/discourse

# Create app.yml configuration file
cat > app.yml << 'EOF'
## this is the all-in-one, standalone Discourse Docker container template
##
## see https://github.com/discourse/discourse/blob/main/docs/INSTALL-docker.md for details

version: '3.8'

services:
  db:
    image: postgres:13
    volumes:
      - volume:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=discourse
      - POSTGRES_USER=discourse
      - POSTGRES_PASSWORD=discourse
      - POSTGRES_ENCODING=UTF8
      - POSTGRES_COLLATE=C
      - POSTGRES_COLLATE_TYPE=C

  redis:
    image: redis:7-alpine
    volumes:
      - volume:/data

  discourse:
    image: discourse/local:latest
    depends_on:
      - db
      - redis
    volumes:
      - volume:/shared
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DISCOURSE_HOSTNAME=discourse.physical-ai-course.org
      - DISCOURSE_DEVELOPER_EMAILS=admin@physical-ai-course.org
      - DISCOURSE_SMTP_HOSTNAME=smtp.gmail.com
      - DISCOURSE_SMTP_PORT=587
      - DISCOURSE_SMTP_PASSWORD=your_app_password
      - DISCOURSE_SMTP_USER_NAME=your_email@gmail.com
      - DISCOURSE_SMTP_ENABLE_START_TLS=true
    ports:
      - "80:3000"
      - "443:3000"

volumes:
  volume:
EOF

# Start Discourse
docker-compose -f app.yml up -d
```

#### 2. Initial Configuration
After installation, access the forum at `http://your-domain.com` and:

1. **Admin Setup**:
   - Create admin account
   - Configure site settings (name, description, logo)
   - Set up email notifications

2. **Categories Setup**:
   ```markdown
   # Forum Categories for Physical AI Course

   ## Module-Specific Categories
   - Module 1: ROS 2 Fundamentals
   - Module 2: Simulation Environments
   - Module 3: AI Perception & Navigation
   - Module 4: Humanoid Robotics Capstone

   ## General Categories
   - Announcements: Course updates and important notices
   - Q&A: General questions and help requests
   - Projects: Student project showcases and discussions
   - Resources: Additional learning materials and tools
   - Feedback: Course feedback and suggestions
   ```

3. **User Groups and Permissions**:
   - Create groups: Students, TAs, Instructors, Alumni
   - Set appropriate permissions for each group
   - Configure trust levels for community moderation

#### 3. Customization for Course Needs
```css
/* Custom CSS for Physical AI Course Forum */
/* Add in Admin > Customize > CSS/HTML */

/* Course branding colors */
body {
  --course-primary: #2E7D32;
  --course-secondary: #1976D2;
  --course-accent: #FF9800;
}

/* Header customization */
.d-header {
  background: linear-gradient(135deg, var(--course-primary), var(--course-secondary));
  color: white;
}

/* Category styling */
.category-breadcrumb a[href*="module-1"] {
  background-color: #E8F5E8 !important;
  color: #2E7D32 !important;
}

.category-breadcrumb a[href*="module-2"] {
  background-color: #E3F2FD !important;
  color: #1976D2 !important;
}

.category-breadcrumb a[href*="module-3"] {
  background-color: #FFF3E0 !important;
  color: #EF6C00 !important;
}

.category-breadcrumb a[href*="module-4"] {
  background-color: #FCE4EC !important;
  color: #C2185B !important;
}

/* Code block styling for technical discussions */
aside.onebox {
  border-left: 4px solid var(--course-primary) !important;
}
```

### GitHub Discussions Setup

#### 1. Enable Discussions in Repository
1. Go to your course repository on GitHub
2. Navigate to "Settings" tab
3. In "Features" section, enable "Discussions"
4. Click "Save"

#### 2. Configure Discussion Categories
```yaml
# .github/discussion_categories.yml (if using GitHub automation)
categories:
  - name: "Module 1: ROS 2 Fundamentals"
    description: "Questions and discussions about ROS 2 concepts and fundamentals"
    emoji: "🤖"
  - name: "Module 2: Simulation Environments"
    description: "Gazebo, Unity, and simulation environment discussions"
    emoji: "🎮"
  - name: "Module 3: AI Perception & Navigation"
    description: "Computer vision, navigation, and AI perception topics"
    emoji: "👁️"
  - name: "Module 4: Humanoid Robotics Capstone"
    description: "Capstone project and humanoid robotics discussions"
    emoji: "🦾"
  - name: "General Q&A"
    description: "General questions about the course"
    emoji: "❓"
  - name: "Project Showcase"
    description: "Share your completed projects here"
    emoji: "🚀"
```

#### 3. Discussion Templates
Create templates in `.github/DISCUSSION_TEMPLATE/`:

**question-template.md**:
```markdown
---
name: Question about Course Content
about: Ask a question about the Physical AI course
title: '[Question] '
labels: question, needs-triage
---

**Module**: [e.g., Module 1, Module 2]

**Question**:
[Describe your question clearly]

**What I've tried**:
[Steps you've taken to solve the problem]

**Additional context**:
[Any additional information that might help]
```

### Discord Server Setup

#### 1. Server Creation and Structure
```markdown
# Physical AI & Humanoid Robotics Course Server

## Categories
### 📚 Course Content
- #module-1-ros2-fundamentals
- #module-2-simulation
- #module-3-ai-perception
- #module-4-capstone

### 💬 General Channels
- #announcements
- #general-chat
- #resources
- #project-showcase

### 🎧 Voice Channels
- Lecture Hall (for live sessions)
- Study Groups (multiple rooms)
- Office Hours
```

#### 2. Bot Integration
```python
# discord_bot_setup.py - Basic bot for course server
import discord
from discord.ext import commands
import asyncio

# Bot setup
intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'{bot.user} has connected to Discord!')

@bot.command(name='modules')
async def list_modules(ctx):
    """List all course modules"""
    modules = """
    **Physical AI & Humanoid Robotics Course Modules:**

    1. **ROS 2 Fundamentals** - Core ROS 2 concepts
    2. **Simulation Environments** - Gazebo, Unity, Digital Twins
    3. **AI Perception & Navigation** - Isaac ROS, Computer Vision
    4. **Humanoid Robotics Capstone** - VLA systems, Capstone Project

    Use #!resources <module_number> for specific resources.
    """
    await ctx.send(modules)

@bot.command(name='resources')
async def get_resources(ctx, module: int):
    """Get resources for a specific module"""
    resources = {
        1: "Module 1 Resources: [Documentation](link) | [Examples](link) | [Videos](link)",
        2: "Module 2 Resources: [Gazebo Tutorials](link) | [Unity Setup](link)",
        3: "Module 3 Resources: [Isaac ROS Guide](link) | [Perception Examples](link)",
        4: "Module 4 Resources: [Capstone Requirements](link) | [VLA Examples](link)"
    }

    if module in resources:
        await ctx.send(resources[module])
    else:
        await ctx.send("Please specify a valid module number (1-4)")

# Run the bot
# bot.run('YOUR_BOT_TOKEN')
```

## Issue Tracker Setup

### GitHub Issues Configuration

#### 1. Issue Templates
Create in `.github/ISSUE_TEMPLATE/`:

**bug_report.yml**:
```yaml
name: Bug Report
about: Report a bug in course materials or code examples
title: '[Bug] '
labels: bug, needs-triage
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Describe the bug in detail
    validations:
      required: true
  - type: dropdown
    id: module
    attributes:
      label: Module
      options:
        - Module 1: ROS 2 Fundamentals
        - Module 2: Simulation Environments
        - Module 3: AI Perception & Navigation
        - Module 4: Humanoid Robotics Capstone
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      description: What did you expect to happen?
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to reproduce
      description: How can we reproduce this bug?
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. See error
    validations:
      required: true
  - type: input
    id: os
    attributes:
      label: Operating System
      placeholder: e.g., Ubuntu 22.04, Windows 11
    validations:
      required: true
  - type: input
    id: ros-version
    attributes:
      label: ROS Version
      placeholder: e.g., Humble Hawksbill, Iron Irwin
    validations:
      required: true
```

**feature_request.yml**:
```yaml
name: Feature Request
about: Suggest an idea for the course
title: '[Feature] '
labels: enhancement, needs-triage
body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a feature for the course!
  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: A clear description of what the problem is.
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Describe the solution you'd like
      description: A clear description of what you want to happen.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Describe alternatives you've considered
      description: A clear description of any alternative solutions or features you've considered.
  - type: textarea
    id: additional
    attributes:
      label: Additional context
      description: Add any other context or screenshots about the feature request here.
```

#### 2. Labels Configuration
```json
// .github/labels.json
[
  {
    "name": "bug",
    "color": "d73a4a",
    "description": "Something isn't working"
  },
  {
    "name": "enhancement",
    "color": "a2eeef",
    "description": "New feature or request"
  },
  {
    "name": "documentation",
    "color": "0075ca",
    "description": "Improvements or additions to documentation"
  },
  {
    "name": "good first issue",
    "color": "7057ff",
    "description": "Good for newcomers"
  },
  {
    "name": "help wanted",
    "color": "008672",
    "description": "Extra attention is needed"
  },
  {
    "name": "module-1",
    "color": "f9d0c4",
    "description": "Related to Module 1: ROS 2"
  },
  {
    "name": "module-2",
    "color": "e11d21",
    "description": "Related to Module 2: Simulation"
  },
  {
    "name": "module-3",
    "color": "c6479e",
    "description": "Related to Module 3: AI Perception"
  },
  {
    "name": "module-4",
    "color": "9e4c98",
    "description": "Related to Module 4: Capstone"
  },
  {
    "name": "needs-triage",
    "color": "d4c5f9",
    "description": "Needs to be categorized"
  },
  {
    "name": "duplicate",
    "color": "cfd3d7",
    "description": "This issue or pull request already exists"
  },
  {
    "name": "wontfix",
    "color": "ffffff",
    "description": "This will not be worked on"
  }
]
```

#### 3. Project Board Setup
Create GitHub Project board with columns:
- To Do: New issues needing triage
- In Progress: Issues being worked on
- Review: Issues ready for review
- Done: Completed issues

### Jira Setup (Alternative)

For enterprise environments, Jira can be configured with:

#### 1. Project Configuration
```
Project Key: PHYSICALAI
Project Type: Task Management
Project Lead: Course Instructor
```

#### 2. Issue Types
- Story: New features or content additions
- Task: Specific work items
- Bug: Issues with course materials
- Epic: Large feature areas (modules)

#### 3. Workflows
```
To Do → In Progress → Code Review → Testing → Done
```

## Community Guidelines and Moderation

### Code of Conduct
```markdown
# Community Code of Conduct

## Our Pledge
In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to make participation in our community a harassment-free experience for everyone.

## Our Standards
Examples of behavior that contributes to creating a positive environment include:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:
- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the community moderators at [moderation-email]. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances.
```

### Moderation Guidelines
```markdown
# Community Moderation Guidelines

## Response Times
- Forum posts: 24-48 hours for initial response
- Issues: 48-72 hours for triage
- Urgent issues: 2-4 hours during business days

## Moderation Team
- Primary Moderator: Course Instructor
- Secondary Moderators: TAs/Teaching Assistants
- Community Moderators: Advanced students (optional)

## Escalation Process
1. User posts question/issue
2. Community members attempt to help
3. If unresolved after 48 hours, escalate to TA
4. If still unresolved, escalate to instructor
5. For technical issues, create GitHub issue
```

## Integration and Automation

### GitHub Actions for Issue Management
```yaml
# .github/workflows/issue-automation.yml
name: Issue Automation

on:
  issues:
    types: [opened]

jobs:
  automate:
    runs-on: ubuntu-latest
    steps:
      - name: Add to project
        uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/users/your-username/projects/1
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Apply labels
        uses: actions/github-script@v6
        with:
          script: |
            const issue = context.payload.issue;
            const body = issue.body || '';
            const title = issue.title || '';

            // Auto-label based on content
            const labels = [];
            if (title.toLowerCase().includes('module 1') || body.toLowerCase().includes('ros')) {
              labels.push('module-1');
            }
            if (title.toLowerCase().includes('module 2') || body.toLowerCase().includes('gazebo') || body.toLowerCase().includes('simulation')) {
              labels.push('module-2');
            }
            if (title.toLowerCase().includes('module 3') || body.toLowerCase().includes('isaac') || body.toLowerCase().includes('perception')) {
              labels.push('module-3');
            }
            if (title.toLowerCase().includes('module 4') || body.toLowerCase().includes('humanoid') || body.toLowerCase().includes('vla')) {
              labels.push('module-4');
            }

            if (labels.length > 0) {
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                labels: labels
              });
            }
```

### Discord Integration with GitHub
```python
# discord_github_integration.py
import discord
from discord.ext import commands
import requests
import json

# Webhook to post GitHub issues to Discord
async def post_github_issue_to_discord(issue_data, channel):
    """Post new GitHub issues to Discord"""
    embed = discord.Embed(
        title=f"New Issue: {issue_data['title']}",
        description=issue_data['body'][:1000] + "..." if len(issue_data['body']) > 1000 else issue_data['body'],
        color=0xff0000,
        url=issue_data['html_url']
    )
    embed.add_field(name="Author", value=issue_data['user']['login'], inline=True)
    embed.add_field(name="Status", value=issue_data['state'], inline=True)
    embed.add_field(name="Module", value=get_module_from_labels(issue_data['labels']), inline=True)

    await channel.send(embed=embed)

def get_module_from_labels(labels):
    """Extract module information from issue labels"""
    for label in labels:
        if 'module' in label['name'].lower():
            return label['name']
    return "General"
```

## Analytics and Monitoring

### Forum Analytics
Track key metrics:
- Daily/Monthly active users
- Post frequency and engagement
- Response times
- Resolution rates
- Popular topics

### Issue Tracking Metrics
- Issue creation rate
- Average resolution time
- Issue categories distribution
- Contributor activity
- Bug vs feature request ratio

## Maintenance and Updates

### Regular Maintenance Tasks
- Monthly: Review and clean up old discussions
- Quarterly: Update forum categories and guidelines
- Bi-annually: Review and update issue templates
- Annually: Evaluate platform needs and consider upgrades

### Backup Procedures
- Forum database backups (daily)
- Issue data exports (weekly)
- Configuration backups (monthly)
- Documentation of customizations (continuous)

This comprehensive setup provides a robust foundation for community engagement and issue tracking in the Physical AI & Humanoid Robotics course, ensuring students have the support they need while maintaining the quality of the educational materials.