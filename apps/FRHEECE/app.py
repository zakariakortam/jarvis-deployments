import streamlit as st

st.set_page_config(
    page_title="Simple App",
    page_icon="🚀",
    layout="centered"
)

st.title("🚀 Simple Streamlit App")

st.write("Welcome to this minimal Streamlit application!")

name = st.text_input("What's your name?", placeholder="Enter your name")

if name:
    st.success(f"Hello, {name}! 👋")

col1, col2 = st.columns(2)

with col1:
    number = st.number_input("Pick a number", min_value=1, max_value=100, value=50)

with col2:
    color = st.selectbox("Choose a color", ["Red", "Blue", "Green", "Yellow"])

if st.button("Generate Message"):
    st.balloons()
    st.info(f"Your number {number} in {color.lower()} is awesome! 🎉")

st.divider()

st.caption("Built with Streamlit ❤️")