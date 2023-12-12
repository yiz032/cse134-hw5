class RatingWidget extends HTMLElement {
    constructor() {
        super();
  
        this.attachShadow({ mode: 'open' });
        this.isFeedbackDisplayed = false;
  
        const template = document.createElement('template');
        template.innerHTML = `
        <style>
            :host {
                display: inline-block;
            }
  
            .stars {
                font-size: 24px;
                cursor: pointer;
                color: var(--star-color-unselected, gray);
            }
  
            .stars:hover {
                color: var(--star-color-selected, yellow);
            }
    
            .hidden {
                display: none;
            }

            .style {
                color: black;
            }

            .hidden:hover {
                color: black; /* Add this rule to keep text color black on hover */
            }
        </style>
  
        <div class="stars">
            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
        
        <div class="hidden">
            <slot></slot>
        </div>

        <div class="hidden">
            <form action="https://httpbin.org/post" method="POST">
            <label for="rating">How satisfied are you?</label>
            <input type="hidden" name="question" value="How satisfied are you?">
            <input type="hidden" name="sentBy" value="HTML">
            <input type="number" id="rating" name="rating" min="1" max="5" value="0" required>
            <button type="submit">Submit</button>
            </form>
        </div>
        `;
  
        this.shadowRoot.appendChild(template.content.cloneNode(true));
  
        this.starsElement = this.shadowRoot.querySelector('.stars');
  
        this.starsElement.addEventListener('mouseover', this.onStarHover.bind(this));
        this.starsElement.addEventListener('click', this.onStarClick.bind(this));
  
        this.formElement = this.shadowRoot.querySelector('form');
        this.formElement.addEventListener('submit', this.onSubmit.bind(this));
    }
  
    onStarHover(event) {
        const stars = this.starsElement.children;
        const hoveredStar = event.target;
        const starIndex = Array.from(stars).indexOf(hoveredStar);
        for (let i = 0; i <= starIndex; i++) {
            stars[i].style.color = getComputedStyle(this).getPropertyValue('--star-color-selected') || 'yellow';
        }

        for (let i = starIndex + 1; i < stars.length; i++) {
            stars[i].style.color = getComputedStyle(this).getPropertyValue('--star-color-unselected') || 'gray';
        }
    }
  
    onStarClick(event) {
        if (this.isFeedbackDisplayed) {
            return;
        }
        const stars = this.starsElement.children;
        const clickedStar = event.target;
        const rating = Array.from(stars).indexOf(clickedStar) + 1;

        this.starsElement.classList.add('hidden');
        const feedbackElement = this.shadowRoot.querySelector('.hidden');
        feedbackElement.innerHTML = this.generateFeedbackMessage(rating);
        feedbackElement.style.color = 'black';
        feedbackElement.classList.remove('hidden');
        this.isFeedbackDisplayed = true;
    }
  
    onSubmit(event) {
        event.preventDefault();
    
        const formData = new FormData(this.formElement);
        const rating = formData.get('rating');

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Sent-By': 'JS',
            },
            body: new URLSearchParams(formData).toString(),
        };
  
        fetch('https://httpbin.org/post', requestOptions)
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
  
    generateFeedbackMessage(rating) {
        if (rating > 3) {
            return `Thanks for the ${rating} star rating!`;
        } else {
            return `Thanks for your feedback of ${rating} stars. We'll try to do better!`;
        }
    }
  }

customElements.define('rating-widget', RatingWidget);
  